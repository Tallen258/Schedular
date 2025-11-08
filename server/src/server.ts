// src/server.ts
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import crypto from "node:crypto";
import { google } from "googleapis";
import dotenv from "dotenv";
import pgPromise from "pg-promise";
dotenv.config();

/* ──────────────────────────────────────────────────────────────
   DB setup (env: DATABASE_URL=postgres://user:pass@host:5432/dbname)
   ────────────────────────────────────────────────────────────── */
const pgp = pgPromise({});
const connectionString = process.env.DATABASE_URL;
let db: ReturnType<typeof pgp> | null = null;

if (!connectionString) {
  console.warn("⚠️  DATABASE_URL not set; Google Calendar integration will be limited to mock data.");
} else {
  try {
    db = pgp(connectionString);
    console.log("✅ Database connection configured");
  } catch (e) {
    console.error("❌ Failed to configure database:", e);
    db = null;
  }
}

export { db };

/* ──────────────────────────────────────────────────────────────
   CORS from env (comma-separated)
   ────────────────────────────────────────────────────────────── */
function buildCorsOptions() {
  const list = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  return {
    origin(origin: string | undefined, cb: (err: Error | null, ok?: boolean) => void) {
      if (!origin) return cb(null, true); // allow curl/Postman
      if (list.length === 0 || list.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  } as Parameters<typeof cors>[0];
}

/* ──────────────────────────────────────────────────────────────
   TEMP requireAuth (replace with your real Keycloak middleware)
   - If DEV_ALLOW_FAKE_USER=true, it fakes a logged-in user.
   - Otherwise it requires an Authorization header but doesn't verify it.
   ────────────────────────────────────────────────────────────── */
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.DEV_ALLOW_FAKE_USER === "true") {
    req.user = { 
      sub: "dev-user-123",
      email: "dev@example.com", 
      name: "Dev User",
      roles: [],
      raw: { sub: "dev-user-123" }
    };
    return next();
  }
  const auth = req.header("authorization");
  if (!auth) return res.status(401).send("Login required");
  // Minimal placeholder: attach a stub so Google linking can store an email
  req.user = { 
    sub: "temp-user",
    email: req.header("x-user-email") ?? "unknown@example.com",
    raw: { sub: "temp-user" }
  };
  next();
};

/* ──────────────────────────────────────────────────────────────
   App setup
   ────────────────────────────────────────────────────────────── */
const app = express();
app.use(cors(buildCorsOptions()));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET ?? "dev-only-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false }, // set secure:true in prod HTTPS
}));

/* ──────────────────────────────────────────────────────────────
   Public
   ────────────────────────────────────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/* ──────────────────────────────────────────────────────────────
   Everything below requires a valid (or dev) auth
   Replace this with your real Keycloak middleware when ready:
   // import { requireAuth } from "./auth";
   // app.use(requireAuth);
   ────────────────────────────────────────────────────────────── */
app.use(requireAuth);

/* ──────────────────────────────────────────────────────────────
   Helper: persist Google tokens
   ────────────────────────────────────────────────────────────── */
async function saveGoogleTokens(userEmail: string, tokens: {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string | null;
  expiry_date?: number | null;
}) {
  if (!db) throw new Error("DB not configured");
  if (!tokens.refresh_token) throw new Error("No refresh_token returned (need prompt=consent & offline)");

  const access = tokens.access_token ?? "";
  const refresh = tokens.refresh_token!;
  const scope = tokens.scope ?? "";
  const expiryMs = Number(tokens.expiry_date ?? (Date.now() + 3500 * 1000));

  await db.none(`
    insert into google_tokens(user_email, access_token, refresh_token, scope, expiry_ms)
    values($1,$2,$3,$4,$5)
    on conflict (user_email) do update set
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      scope = excluded.scope,
      expiry_ms = excluded.expiry_ms,
      updated_at = now()
  `, [userEmail, access, refresh, scope, expiryMs]);
}

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

/* ──────────────────────────────────────────────────────────────
   Google OAuth (link Google to the currently logged-in user)
   ────────────────────────────────────────────────────────────── */
const oauth2 = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

/**
 * Start: authenticated POST that returns the Google consent URL.
 * Frontend calls with Authorization: Bearer <token> and credentials: "include"
 */
app.post("/api/auth/google/start", (req: Request, res: Response) => {
  if (!req.user?.email) return res.status(401).send("Login required");

  const state = crypto.randomBytes(16).toString("hex");
  (req.session as any).oauth_state = state;
  (req.session as any).link_user_email = req.user.email;

  const url = oauth2.generateAuthUrl({
    access_type: "offline",               // request refresh token
    prompt: "consent",                    // force refresh token if already granted
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
    state,
  });

  res.json({ url });
});

/**
 * Callback: exchange code, save tokens, and redirect to calendar page
 */
app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send("Missing code/state");

    if ((req.session as any).oauth_state !== state) {
      return res.status(400).send("State mismatch");
    }

    const who = (req.session as any).link_user_email;
    if (!who) return res.status(401).send("User context missing—start from /api/auth/google/start");

    const { tokens } = await oauth2.getToken(String(code));
    await saveGoogleTokens(who, tokens);  // persist refresh token

    // redirect back to your app UI (e.g., Calendar page) after linking
    res.redirect((process.env.POST_LINK_REDIRECT ?? "http://localhost:5173") + "/calendar?linked=1");
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message ?? "Google auth failed" });
  }
});

/* ──────────────────────────────────────────────────────────────
   Example protected endpoints
   ────────────────────────────────────────────────────────────── */
app.get("/api/whoami", (req: Request, res: Response) => {
  res.json({
    sub: req.user?.sub ?? null,
    email: req.user?.email ?? null,
    name: req.user?.name ?? null,
    roles: req.user?.roles ?? [],
  });
});

app.get("/api/secure-example", (_req: Request, res: Response) => {
  res.json({ secret: "you are authenticated 🎉" });
});

/**
 * Get upcoming Google Calendar events for the authenticated user
 */
app.get("/api/google/calendar/upcoming", async (req: Request, res: Response) => {
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
 * Get calendar events (mock data for now - falls back if no Google connection)
 * TODO: Remove this once Google Calendar integration is fully working
 */
app.get("/api/calendar/events", (req: Request, res: Response) => {
  if (!req.user?.email) return res.status(401).send("Login required");

  // Mock calendar events for demonstration
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

/* ──────────────────────────────────────────────────────────────
   Events CRUD API
   ────────────────────────────────────────────────────────────── */

/**
 * GET /api/events - List all events for the authenticated user
 */
app.get("/api/events", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    
    if (!db) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const events = await db.any(`
      select id, user_email, title, description, location, 
             start_time, end_time, all_day, created_at, updated_at
      from events
      where user_email = $1
      order by start_time asc
    `, [req.user.email]);

    res.json({ events });
  } catch (e: any) {
    console.error("Error fetching events:", e);
    res.status(500).json({ error: e.message ?? "Failed to fetch events" });
  }
});

/**
 * GET /api/events/:id - Get a single event by ID
 */
app.get("/api/events/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    
    if (!db) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const event = await db.oneOrNone(`
      select id, user_email, title, description, location, 
             start_time, end_time, all_day, created_at, updated_at
      from events
      where id = $1 and user_email = $2
    `, [req.params.id, req.user.email]);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ event });
  } catch (e: any) {
    console.error("Error fetching event:", e);
    res.status(500).json({ error: e.message ?? "Failed to fetch event" });
  }
});

/**
 * POST /api/events - Create a new event
 */
app.post("/api/events", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    
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

    const event = await db.one(`
      insert into events (user_email, title, description, location, start_time, end_time, all_day)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning id, user_email, title, description, location, start_time, end_time, all_day, created_at, updated_at
    `, [
      req.user.email,
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

/**
 * PUT /api/events/:id - Update an existing event
 */
app.put("/api/events/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    
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

    const event = await db.oneOrNone(`
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

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ event });
  } catch (e: any) {
    console.error("Error updating event:", e);
    res.status(500).json({ error: e.message ?? "Failed to update event" });
  }
});

/**
 * DELETE /api/events/:id - Delete an event
 */
app.delete("/api/events/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) return res.status(401).send("Login required");
    
    if (!db) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const result = await db.result(`
      delete from events
      where id = $1 and user_email = $2
    `, [req.params.id, req.user.email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true, message: "Event deleted" });
  } catch (e: any) {
    console.error("Error deleting event:", e);
    res.status(500).json({ error: e.message ?? "Failed to delete event" });
  }
});

/* ──────────────────────────────────────────────────────────────
   Start
   ────────────────────────────────────────────────────────────── */
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API on http://localhost:${port}`));
