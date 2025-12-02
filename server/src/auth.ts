// src/auth.ts
import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

const ISSUER = process.env.OIDC_ISSUER || "https://auth-dev.snowse.io/realms/DevRealm";
const AUDIENCE = process.env.OIDC_AUDIENCE || "taft-chat"; // usually your Keycloak client_id (expected aud/azp)
const JWKS_URI = `${ISSUER}/protocol/openid-connect/certs`;
const JWKS = createRemoteJWKSet(new URL(JWKS_URI));

export type User = {
  sub: string;
  email: string;
  name: string;
  roles?: string[];
};

export async function verifyJWT(authHeader: string): Promise<User> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const token = authHeader.slice(7).trim();
  console.log(token);
  if (!token) throw new Error("No token found");
  
  // Keycloak tokens have aud="account" and azp="taft-chat", so accept "account"
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: ISSUER,
    audience: "account",   // Accept "account" which is what Keycloak issues
    clockTolerance: 15,   // small skew tolerance
  });
  
  // Extract roles from realm_access if present
  const realmAccess = (payload as any).realm_access;
  const roles = realmAccess?.roles ?? [];
  
  return {
    sub: String(payload.sub ?? ""),
    email: String((payload as any).email ?? ""),
    name: String((payload as any).name ?? ""),
    roles,
  };
}      
  
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await verifyJWT(req.header("authorization") ?? "");
    req.user = user;

    console.log("auth:user", user.email);

    next();
  } catch (err: any) {
    // Keep it descriptive but not leaky
    return res.status(401).json({ error: "Invalid or expired token", detail: String(err?.message || "") });
  }
}

// Optional auth middleware - sets req.user if token is present and valid, but doesn't fail if missing
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.header("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const user = await verifyJWT(authHeader);
      req.user = user;
      console.log("optional auth:user", user.email);
    } else {
      console.log("optional auth: no token provided");
    }
    next();
  } catch (err: any) {
    console.log("optional auth: invalid token, continuing without auth");
    // Continue without auth even if token is invalid
    next();
  }
}
