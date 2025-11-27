// src/routes/events.ts
import { Router, type Request, type Response } from "express";
import { db } from "../server";

const router = Router();


router.get("/calendar/events", (req: Request, res: Response) => {
  // Works for both authenticated and unauthenticated users
  if (!req.user?.email) {
    return res.json({ events: [] });
  }

  const mockEvents = [
    {
      id: "1",
      summary: "Team Meeting",
      description: "Weekly team sync",
      start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
      end: { dateTime: new Date(Date.now() + 90000000).toISOString() },
      location: "Conference Room A",
    },
    {
      id: "2",
      summary: "Project Deadline",
      description: "Submit final project",
      start: { dateTime: new Date(Date.now() + 172800000).toISOString() },
      end: { dateTime: new Date(Date.now() + 176400000).toISOString() },
    },
    {
      id: "3",
      summary: "Lunch with Client",
      description: "Discuss new requirements",
      start: { dateTime: new Date(Date.now() + 259200000).toISOString() },
      end: { dateTime: new Date(Date.now() + 262800000).toISOString() },
      location: "Downtown Restaurant",
    },
  ];

  res.json({ events: mockEvents });
});

router.get("/", async (req: Request, res: Response) => {
  try {
    if (!db) {
      return res.status(503).json({ error: "Database not configured" });
    }

    let events;
    
    // For authenticated users, get their events
    if (req.user?.email) {
      console.log(`[GET /events] Fetching events for authenticated user: ${req.user.email}`);
      events = await db.any(`
        select id, user_email, title, description, location, 
               start_time, end_time, all_day, created_at, updated_at
        from events
        where user_email = $1
        order by start_time asc
      `, [req.user.email]);
    } else {
      // For anonymous users, get anonymous events
      console.log('[GET /events] Fetching events for anonymous user');
      events = await db.any(`
        select id, user_email, title, description, location, 
               start_time, end_time, all_day, created_at, updated_at
        from events
        where user_email = 'anonymous' OR user_email IS NULL
        order by start_time asc
      `);
    }

    console.log(`[GET /events] Returning ${events.length} events`);
    res.json({ events });
  } catch (e: any) {
    console.error("Error fetching events:", e);
    res.status(500).json({ error: e.message ?? "Failed to fetch events" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    if (!db) {
      return res.status(503).json({ error: "Database not configured" });
    }

    let event;
    
    if (req.user?.email) {
      // Authenticated user - get their event
      event = await db.oneOrNone(`
        select id, user_email, title, description, location, 
               start_time, end_time, all_day, created_at, updated_at
        from events
        where id = $1 and user_email = $2
      `, [req.params.id, req.user.email]);
    } else {
      // Anonymous user - get anonymous event
      event = await db.oneOrNone(`
        select id, user_email, title, description, location, 
               start_time, end_time, all_day, created_at, updated_at
        from events
        where id = $1 and (user_email = 'anonymous' OR user_email IS NULL)
      `, [req.params.id]);
    }

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ event });
  } catch (e: any) {
    console.error("Error fetching event:", e);
    res.status(500).json({ error: e.message ?? "Failed to fetch event" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    if (!db) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { title, description, location, start_time, end_time, all_day } = req.body;

    // Validation
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ 
        error: "Missing required fields: title, start_time, end_time" 
      });
    }

    // Use authenticated user's email or 'anonymous'
    const userEmail = req.user?.email || 'anonymous';
    console.log(`[POST /events] Creating event for user: ${userEmail}`);

    const event = await db.one(`
      insert into events (user_email, title, description, location, start_time, end_time, all_day)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning id, user_email, title, description, location, start_time, end_time, all_day, created_at, updated_at
    `, [
      userEmail,
      title,
      description || null,
      location || null,
      start_time,
      end_time,
      all_day || false
    ]);

    res.status(201).json({ event });
  } catch (e: any) {
    console.error("Error creating event:", e);
    res.status(500).json({ error: e.message ?? "Failed to create event" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    if (!db) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { title, description, location, start_time, end_time, all_day } = req.body;

    // Validation
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ 
        error: "Missing required fields: title, start_time, end_time" 
      });
    }

    let event;
    
    if (req.user?.email) {
      // Authenticated user - update their event
      event = await db.oneOrNone(`
        update events
        set title = $3, description = $4, location = $5, 
            start_time = $6, end_time = $7, all_day = $8
        where id = $1 and user_email = $2
        returning id, user_email, title, description, location, start_time, end_time, all_day, created_at, updated_at
      `, [
        req.params.id,
        req.user.email,
        title,
        description || null,
        location || null,
        start_time,
        end_time,
        all_day || false
      ]);
    } else {
      // Anonymous user - update anonymous event
      event = await db.oneOrNone(`
        update events
        set title = $2, description = $3, location = $4, 
            start_time = $5, end_time = $6, all_day = $7
        where id = $1 and (user_email = 'anonymous' OR user_email IS NULL)
        returning id, user_email, title, description, location, start_time, end_time, all_day, created_at, updated_at
      `, [
        req.params.id,
        title,
        description || null,
        location || null,
        start_time,
        end_time,
        all_day || false
      ]);
    }

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ event });
  } catch (e: any) {
    console.error("Error updating event:", e);
    res.status(500).json({ error: e.message ?? "Failed to update event" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    if (!db) {
      return res.status(503).json({ error: "Database not configured" });
    }

    let result;
    
    if (req.user?.email) {
      // Authenticated user - delete their event
      result = await db.result(`
        delete from events
        where id = $1 and user_email = $2
      `, [req.params.id, req.user.email]);
    } else {
      // Anonymous user - delete anonymous event
      result = await db.result(`
        delete from events
        where id = $1 and (user_email = 'anonymous' OR user_email IS NULL)
      `, [req.params.id]);
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true, message: "Event deleted" });
  } catch (e: any) {
    console.error("Error deleting event:", e);
    res.status(500).json({ error: e.message ?? "Failed to delete event" });
  }
});

export default router;
