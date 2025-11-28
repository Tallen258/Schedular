import type { IDatabase } from "pg-promise";

const EVENT_SELECT_FIELDS = `
  id, user_email, title, description, location, 
  start_time, end_time, all_day, created_at, updated_at
`;

export async function fetchUserEvents(db: IDatabase<unknown>, userEmail: string | undefined) {
  if (userEmail) {
    return await db.any(
      `select ${EVENT_SELECT_FIELDS} from events where user_email = $1 order by start_time asc`,
      [userEmail]
    );
  } else {
    return await db.any(
      `select ${EVENT_SELECT_FIELDS} from events 
       where user_email = 'anonymous' OR user_email IS NULL 
       order by start_time asc`
    );
  }
}

export async function fetchEventById(
  db: IDatabase<unknown>,
  eventId: string,
  userEmail: string | undefined
) {
  if (userEmail) {
    return await db.oneOrNone(
      `select ${EVENT_SELECT_FIELDS} from events where id = $1 and user_email = $2`,
      [eventId, userEmail]
    );
  } else {
    return await db.oneOrNone(
      `select ${EVENT_SELECT_FIELDS} from events 
       where id = $1 and (user_email = 'anonymous' OR user_email IS NULL)`,
      [eventId]
    );
  }
}

export async function createEvent(
  db: IDatabase<unknown>,
  userEmail: string | undefined,
  eventData: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    all_day?: boolean;
  }
) {
  const email = userEmail || 'anonymous';
  return await db.one(
    `insert into events (user_email, title, description, location, start_time, end_time, all_day)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning ${EVENT_SELECT_FIELDS}`,
    [
      email,
      eventData.title,
      eventData.description || null,
      eventData.location || null,
      eventData.start_time,
      eventData.end_time,
      eventData.all_day || false
    ]
  );
}

export async function updateEvent(
  db: IDatabase<unknown>,
  eventId: string,
  userEmail: string | undefined,
  eventData: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    all_day?: boolean;
  }
) {
  if (userEmail) {
    return await db.oneOrNone(
      `update events
       set title = $3, description = $4, location = $5, 
           start_time = $6, end_time = $7, all_day = $8
       where id = $1 and user_email = $2
       returning ${EVENT_SELECT_FIELDS}`,
      [eventId, userEmail, eventData.title, eventData.description || null,
       eventData.location || null, eventData.start_time, eventData.end_time, eventData.all_day || false]
    );
  } else {
    return await db.oneOrNone(
      `update events
       set title = $2, description = $3, location = $4, 
           start_time = $5, end_time = $6, all_day = $7
       where id = $1 and (user_email = 'anonymous' OR user_email IS NULL)
       returning ${EVENT_SELECT_FIELDS}`,
      [eventId, eventData.title, eventData.description || null,
       eventData.location || null, eventData.start_time, eventData.end_time, eventData.all_day || false]
    );
  }
}

export async function deleteEvent(
  db: IDatabase<unknown>,
  eventId: string,
  userEmail: string | undefined
) {
  if (userEmail) {
    return await db.result(`delete from events where id = $1 and user_email = $2`, [eventId, userEmail]);
  } else {
    return await db.result(
      `delete from events where id = $1 and (user_email = 'anonymous' OR user_email IS NULL)`,
      [eventId]
    );
  }
}
