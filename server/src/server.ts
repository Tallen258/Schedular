// src/server.ts
import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import pgPromise from "pg-promise";

// Import route modules
import authRoutes from "./Endpoints/auth";
import googleOAuthRoutes from "./Endpoints/googleOAuth";
import googleCalendarRoutes from "./Endpoints/googleCalendar";
import eventsRoutes from "./Endpoints/events";
import chatRoutes from "./Endpoints/chat";
import scheduleCompareRoutes from "./Endpoints/scheduleCompare";
import { conversationsRouter } from "./Endpoints/conversation";
import { requireAuth } from "./auth";
import { optionalAuth } from "./auth";

dotenv.config();


const pgp = pgPromise({});
const connectionString = process.env.DATABASE_URL;
let db: ReturnType<typeof pgp> | null = null;

if (!connectionString) {
  console.warn("⚠️  DATABASE_URL not set; Google Calendar integration will be limited to mock data.");
} else {
  try {
    db = pgp(connectionString);
    console.log(" Database connection configured");
  } catch (e) {
    console.error(" Failed to configure database:", e);
    db = null;
  }
}

export { db };


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
   Auth middleware (imported from ./auth.ts)
   - Verifies JWT tokens from Keycloak
   - Validates issuer and audience
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


app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Public routes with optional authentication (works for both logged in and anonymous users)
app.use("/api/events", optionalAuth, eventsRoutes);
app.use("/api/calendar", optionalAuth, eventsRoutes);  // For /api/calendar/events endpoint

// Protected routes (authentication required)
if (db) {
  app.use("/api/conversations", requireAuth, conversationsRouter(db));
}

app.use("/api/chat", requireAuth, chatRoutes);
app.use("/api/schedule", requireAuth, scheduleCompareRoutes);

// Google OAuth routes - /start requires auth, /callback is public (Google redirects to it)
app.use("/api/auth/google", googleOAuthRoutes);

// Google Calendar routes (require auth)
app.use("/api", requireAuth, authRoutes);
app.use("/api/google/calendar", requireAuth, googleCalendarRoutes);


const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API on http://localhost:${port}`));
