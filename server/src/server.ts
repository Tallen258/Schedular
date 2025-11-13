// src/server.ts
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import pgPromise from "pg-promise";

// Import route modules
import authRoutes from "./Endpoints/auth";
import googleOAuthRoutes from "./Endpoints/googleOAuth";
import googleCalendarRoutes from "./Endpoints/googleCalendar";
import eventsRoutes from "./Endpoints/events";

dotenv.config();


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


app.use(requireAuth);


app.use("/api", authRoutes);
app.use("/api/auth/google", googleOAuthRoutes);
app.use("/api/google/calendar", googleCalendarRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api", eventsRoutes);  // For /api/calendar/events endpoint


const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API on http://localhost:${port}`));
