// src/auth.ts
import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const ISSUER = process.env.AUTH_ISSUER;          // e.g. https://auth-dev.snowse.io/realms/DevRealm
const AUDIENCE = process.env.AUTH_AUDIENCE || undefined;
// Optional override; otherwise we derive from ISSUER (Keycloak default)
const JWKS_URI = process.env.AUTH_JWKS_URI || (ISSUER
  ? (ISSUER.endsWith("/")
      ? `${ISSUER}protocol/openid-connect/certs`
      : `${ISSUER}/protocol/openid-connect/certs`)
  : undefined);

if (!ISSUER) {
  throw new Error("AUTH_ISSUER env var is required");
}
if (!JWKS_URI) {
  throw new Error("AUTH_JWKS_URI could not be derived; set AUTH_JWKS_URI or AUTH_ISSUER correctly");
}

const JWKS = createRemoteJWKSet(new URL(JWKS_URI));

export interface AuthUser {
  sub: string;
  email?: string;
  name?: string;
  roles?: string[];
  raw: JWTPayload;
}

declare global {
  namespace Express {
    interface Request { user?: AuthUser }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization") ?? req.header("Authorization");
    if (!header?.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({ error: "missing_bearer_token" });
    }
    const token = header.slice(7).trim();

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: AUDIENCE, // if undefined, audience isn’t enforced
    });

    const email =
      (payload.email as string | undefined) ??
      (payload["preferred_username"] as string | undefined);
    const name =
      (payload.name as string | undefined) ??
      (payload["given_name"] as string | undefined);

    let roles: string[] | undefined;
    const realmAccess = payload["realm_access"] as { roles?: string[] } | undefined;
    if (realmAccess?.roles?.length) roles = realmAccess.roles;

    req.user = {
      sub: String(payload.sub),
      email,
      name,
      roles,
      raw: payload,
    };
    next();
  } catch {
    return res.status(401).json({ error: "invalid_or_expired_token" });
  }
}
