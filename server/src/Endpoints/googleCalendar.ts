// src/routes/googleCalendar.ts
import { Router, type Request, type Response } from "express";
import { google } from "googleapis";
import { db } from "../server";
import { oauth2 } from "./googleOAuth";

const router = Router();

/* ──────────────────────────────────────────────────────────────
   Helper: load calendar client for a user (auto-refresh & keep DB in sync)
   ────────────────────────────────────────────────────────────── */
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

  // keep DB updated when googleapis refreshes tokens
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

/**
 * Get upcoming Google Calendar events for the authenticated user
 */
router.get("/upcoming", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    
    if (!db) {
      return res.status(503).json({ 
        error: "Database not configured. Please set DATABASE_URL environment variable and ensure PostgreSQL is running." 
      });
    }
    
    const cal = await getCalendarClientFor(req.user.email);

    const nowIso = new Date().toISOString();
    const { data } = await cal.events.list({
      calendarId: "primary",
      timeMin: nowIso,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 25,
    });

    const items = (data.items ?? []).map(e => ({
      id: e.id!,
      summary: e.summary ?? "(no title)",
      start: e.start?.dateTime ?? e.start?.date ?? null,
      end: e.end?.dateTime ?? e.end?.date ?? null,
      location: e.location ?? null,
      attendees: (e.attendees ?? []).map(a => ({ email: a.email ?? "", responseStatus: a.responseStatus })),
      hangoutLink: e.hangoutLink ?? null,
    }));

    res.json({ items });
  } catch (e: any) {
    console.error("Error fetching Google Calendar events:", e);
    res.status(500).json({ error: e.message ?? "Failed to fetch events" });
  }
});

/**
 * POST /sync - Import Google Calendar events to local database
 */
router.post("/sync", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    
    if (!db) {
      return res.status(503).json({ error: "Database not configured" });
    }
    
    const cal = await getCalendarClientFor(req.user.email);
    const nowIso = new Date().toISOString();
    const { data } = await cal.events.list({
      calendarId: "primary",
      timeMin: nowIso,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    });

    const googleEvents = data.items ?? [];
    const importedEvents = [];
    let skippedCount = 0;

    for (const gEvent of googleEvents) {
      // Skip events without proper time information
      const startTime = gEvent.start?.dateTime ?? gEvent.start?.date;
      const endTime = gEvent.end?.dateTime ?? gEvent.end?.date;
      
      if (!startTime || !endTime) {
        skippedCount++;
        continue;
      }

      const title = gEvent.summary ?? "(No title)";
      const description = gEvent.description ?? null;
      const location = gEvent.location ?? null;
      const googleEventId = gEvent.id!;
      
      // Determine if it's an all-day event (date only, no dateTime)
      const isAllDay = !gEvent.start?.dateTime;

      try {
        // Check if event already exists (by google_event_id)
        const existing = await db.oneOrNone(`
          select id from events 
          where user_email = $1 and google_event_id = $2
        `, [req.user.email, googleEventId]);

        if (existing) {
          // Update existing event
          const event = await db.one(`
            update events
            set title = $3, description = $4, location = $5, 
                start_time = $6, end_time = $7, all_day = $8, 
                updated_at = now()
            where id = $1 and user_email = $2
            returning id, user_email, title, description, location, 
                      start_time, end_time, all_day, google_event_id, 
                      created_at, updated_at
          `, [
            existing.id,
            req.user.email,
            title,
            description,
            location,
            startTime,
            endTime,
            isAllDay
          ]);
          importedEvents.push(event);
        } else {
          // Insert new event
          const event = await db.one(`
            insert into events (
              user_email, title, description, location, 
              start_time, end_time, all_day, google_event_id
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8)
            returning id, user_email, title, description, location, 
                      start_time, end_time, all_day, google_event_id, 
                      created_at, updated_at
          `, [
            req.user.email,
            title,
            description,
            location,
            startTime,
            endTime,
            isAllDay,
            googleEventId
          ]);
          importedEvents.push(event);
        }
      } catch (err: any) {
        console.error(`Failed to import event ${googleEventId}:`, err);
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

/**
 * POST /import/:eventId - Import a single Google Calendar event
 */
router.post("/import/:eventId", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    
    if (!db) {
      return res.status(503).json({ error: "Database not configured" });
    }
    
    const cal = await getCalendarClientFor(req.user.email);
    const eventId = req.params.eventId;

    // Fetch the specific event from Google Calendar
    const { data: gEvent } = await cal.events.get({
      calendarId: "primary",
      eventId: eventId,
    });

    const startTime = gEvent.start?.dateTime ?? gEvent.start?.date;
    const endTime = gEvent.end?.dateTime ?? gEvent.end?.date;
    
    if (!startTime || !endTime) {
      return res.status(400).json({ error: "Event missing time information" });
    }

    const title = gEvent.summary ?? "(No title)";
    const description = gEvent.description ?? null;
    const location = gEvent.location ?? null;
    const isAllDay = !gEvent.start?.dateTime;

    // Check if event already exists
    const existing = await db.oneOrNone(`
      select id from events 
      where user_email = $1 and google_event_id = $2
    `, [req.user.email, eventId]);

    let event;
    if (existing) {
      // Update existing event
      event = await db.one(`
        update events
        set title = $3, description = $4, location = $5, 
            start_time = $6, end_time = $7, all_day = $8, 
            updated_at = now()
        where id = $1 and user_email = $2
        returning id, user_email, title, description, location, 
                  start_time, end_time, all_day, google_event_id, 
                  created_at, updated_at
      `, [
        existing.id,
        req.user.email,
        title,
        description,
        location,
        startTime,
        endTime,
        isAllDay
      ]);
    } else {
      // Insert new event
      event = await db.one(`
        insert into events (
          user_email, title, description, location, 
          start_time, end_time, all_day, google_event_id
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        returning id, user_email, title, description, location, 
                  start_time, end_time, all_day, google_event_id, 
                  created_at, updated_at
      `, [
        req.user.email,
        title,
        description,
        location,
        startTime,
        endTime,
        isAllDay,
        eventId
      ]);
    }

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
