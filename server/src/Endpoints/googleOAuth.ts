// src/routes/googleOAuth.ts
import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import { google } from "googleapis";
import { db } from "../server";

const router = Router();

/* ──────────────────────────────────────────────────────────────
   Google OAuth Setup
   ────────────────────────────────────────────────────────────── */
const oauth2 = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

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

/**
 * Start: authenticated POST that returns the Google consent URL.
 * Frontend calls with Authorization: Bearer <token> and credentials: "include"
 */
router.post("/start", (req: Request, res: Response) => {
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
router.get("/callback", async (req: Request, res: Response) => {
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

export default router;
export { oauth2 };
