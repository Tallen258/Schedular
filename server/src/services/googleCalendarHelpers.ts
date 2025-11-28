import type { calendar_v3 } from "googleapis";
import { db } from "../server";

export async function upsertGoogleEvent(
  userEmail: string,
  gEvent: calendar_v3.Schema$Event,
  googleEventId: string
) {
  if (!db) throw new Error("DB not configured");

  const startTime = gEvent.start?.dateTime ?? gEvent.start?.date;
  const endTime = gEvent.end?.dateTime ?? gEvent.end?.date;

  if (!startTime || !endTime) {
    throw new Error("Event missing time information");
  }

  const title = gEvent.summary ?? "(No title)";
  const description = gEvent.description ?? null;
  const location = gEvent.location ?? null;
  const isAllDay = !gEvent.start?.dateTime;

  const existing = await db.oneOrNone(
    `select id from events where user_email = $1 and google_event_id = $2`,
    [userEmail, googleEventId]
  );

  if (existing) {
    return await db.one(
      `update events
       set title = $3, description = $4, location = $5, 
           start_time = $6, end_time = $7, all_day = $8, updated_at = now()
       where id = $1 and user_email = $2
       returning id, user_email, title, description, location, 
                 start_time, end_time, all_day, google_event_id, 
                 created_at, updated_at`,
      [existing.id, userEmail, title, description, location, startTime, endTime, isAllDay]
    );
  } else {
    return await db.one(
      `insert into events (user_email, title, description, location, 
                           start_time, end_time, all_day, google_event_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id, user_email, title, description, location, 
                 start_time, end_time, all_day, google_event_id, 
                 created_at, updated_at`,
      [userEmail, title, description, location, startTime, endTime, isAllDay, googleEventId]
    );
  }
}

export function mapGoogleEvent(e: calendar_v3.Schema$Event) {
  return {
    id: e.id!,
    summary: e.summary ?? "(no title)",
    start: e.start?.dateTime ?? e.start?.date ?? null,
    end: e.end?.dateTime ?? e.end?.date ?? null,
    location: e.location ?? null,
    attendees: (e.attendees ?? []).map(a => ({ 
      email: a.email ?? "", 
      responseStatus: a.responseStatus 
    })),
    hangoutLink: e.hangoutLink ?? null,
  };
}
