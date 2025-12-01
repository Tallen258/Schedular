// src/routes/googleCalendar.ts
import { Router, type Request, type Response } from "express";
import { google } from "googleapis";
import { db } from "../server.js";
import { oauth2 } from "./googleOAuth.js";
import { upsertGoogleEvent, mapGoogleEvent } from "../services/googleCalendarHelpers.js";

const router = Router();

async function getCalendarClientFor(userEmail: string) {
  if (!db) throw new Error("DB not configured");

  const row = await db.oneOrNone<{
    access_token: string; refresh_token: string; scope: string; expiry_ms: number;
  }>(`select access_token, refresh_token, scope, expiry_ms from google_tokens where user_email=$1`, [userEmail]);

  if (!row) throw new Error("No Google tokens stored for this user");

  oauth2.setCredentials({
    access_token: row.access_token,
    refresh_token: row.refresh_token,
    scope: row.scope,
    expiry_date: Number(row.expiry_ms),
  });

  oauth2.on("tokens", async (t) => {
    try {
      if (!db) return;
      if (t.access_token) {
        await db.none(
          `update google_tokens set access_token=$2, expiry_ms=$3, updated_at=now() where user_email=$1`,
          [userEmail, t.access_token, Number(t.expiry_date ?? (Date.now() + 3500 * 1000))]
        );
      }
      if (t.refresh_token) {
        await db.none(
          `update google_tokens set refresh_token=$2, updated_at=now() where user_email=$1`,
          [userEmail, t.refresh_token]
        );
      }
    } catch (e) {
      console.error("Failed to update tokens after refresh:", e);
    }
  });

  return google.calendar({ version: "v3", auth: oauth2 });
}

router.get("/upcoming", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    if (!db) return res.status(503).json({ error: "Database not configured" });
    
    const cal = await getCalendarClientFor(req.user.email);
    const { data } = await cal.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 25,
    });

    res.json({ items: (data.items ?? []).map(mapGoogleEvent) });
  } catch (e: any) {
    console.error("Error fetching Google Calendar events:", e);
    res.status(500).json({ error: e.message ?? "Failed to fetch events" });
  }
});

router.post("/sync", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    if (!db) return res.status(503).json({ error: "Database not configured" });
    
    const cal = await getCalendarClientFor(req.user.email);
    const { data } = await cal.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    });

    const googleEvents = data.items ?? [];
    const importedEvents = [];
    let skippedCount = 0;

    for (const gEvent of googleEvents) {
      const startTime = gEvent.start?.dateTime ?? gEvent.start?.date;
      const endTime = gEvent.end?.dateTime ?? gEvent.end?.date;
      
      if (!startTime || !endTime) {
        skippedCount++;
        continue;
      }

      try {
        const event = await upsertGoogleEvent(req.user.email, gEvent, gEvent.id!);
        importedEvents.push(event);
      } catch (err: any) {
        console.error(`Failed to import event ${gEvent.id}:`, err);
        skippedCount++;
      }
    }

    res.json({ 
      success: true,
      imported: importedEvents.length,
      skipped: skippedCount,
      total: googleEvents.length,
      events: importedEvents
    });
  } catch (e: any) {
    console.error("Error syncing Google Calendar events:", e);
    res.status(500).json({ error: e.message ?? "Failed to sync events" });
  }
});

router.post("/import/:eventId", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    if (!db) return res.status(503).json({ error: "Database not configured" });
    
    const cal = await getCalendarClientFor(req.user.email);
    const eventId = req.params.eventId;

    const { data: gEvent } = await cal.events.get({
      calendarId: "primary",
      eventId: eventId,
    });

    const existing = await db.oneOrNone(
      `select id from events where user_email = $1 and google_event_id = $2`,
      [req.user.email, eventId]
    );

    const event = await upsertGoogleEvent(req.user.email, gEvent, eventId);

    res.json({ 
      success: true,
      event,
      action: existing ? 'updated' : 'created'
    });
  } catch (e: any) {
    console.error("Error importing Google Calendar event:", e);
    res.status(500).json({ error: e.message ?? "Failed to import event" });
  }
});

export default router;
