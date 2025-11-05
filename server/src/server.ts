// src/server.ts
import express from "express";
import cors from "cors";
import { requireAuth } from "./auth";

// Build CORS from env (comma-separated)
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

const app = express();
app.use(cors(buildCorsOptions()));
app.use(express.json());

// Public
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Everything below requires a valid Bearer token
app.use(requireAuth);

app.get("/api/whoami", (req, res) => {
  res.json({
    sub: req.user?.sub ?? null,
    email: req.user?.email ?? null,
    name: req.user?.name ?? null,
    roles: req.user?.roles ?? [],
  });
});

// Example protected endpoint
app.get("/api/secure-example", (_req, res) => {
  res.json({ secret: "you are authenticated 🎉" });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API on http://localhost:${port}`));
