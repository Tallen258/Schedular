// src/routes/events.ts
import { Router, type Request, type Response } from "express";
import { db } from "../server.js";
import { fetchUserEvents, fetchEventById, createEvent, updateEvent, deleteEvent } from "../services/eventHelpers.js";

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
    if (!db) return res.status(503).json({ error: "Database not configured" });
    const events = await fetchUserEvents(db, req.user?.email);
    res.json({ events });
  } catch (e: any) {
    console.error("Error fetching events:", e);
    res.status(500).json({ error: e.message ?? "Failed to fetch events" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not configured" });
    const event = await fetchEventById(db, req.params.id, req.user?.email);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ event });
  } catch (e: any) {
    console.error("Error fetching event:", e);
    res.status(500).json({ error: e.message ?? "Failed to fetch event" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not configured" });

    const { title, description, location, start_time, end_time, all_day } = req.body;
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing required fields: title, start_time, end_time" });
    }

    const event = await createEvent(db, req.user?.email, {
      title, description, location, start_time, end_time, all_day
    });

    res.status(201).json({ event });
  } catch (e: any) {
    console.error("Error creating event:", e);
    res.status(500).json({ error: e.message ?? "Failed to create event" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not configured" });

    const { title, description, location, start_time, end_time, all_day } = req.body;
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing required fields: title, start_time, end_time" });
    }

    const event = await updateEvent(db, req.params.id, req.user?.email, {
      title, description, location, start_time, end_time, all_day
    });

    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ event });
  } catch (e: any) {
    console.error("Error updating event:", e);
    res.status(500).json({ error: e.message ?? "Failed to update event" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not configured" });
    
    const result = await deleteEvent(db, req.params.id, req.user?.email);
    if (result.rowCount === 0) return res.status(404).json({ error: "Event not found" });

    res.json({ success: true, message: "Event deleted" });
  } catch (e: any) {
    console.error("Error deleting event:", e);
    res.status(500).json({ error: e.message ?? "Failed to delete event" });
  }
});

export default router;
