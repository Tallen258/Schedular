// src/routes/auth.ts
import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * Get current user info
 */
router.get("/whoami", (req: Request, res: Response) => {
  res.json({
    sub: req.user?.sub ?? null,
    email: req.user?.email ?? null,
    name: req.user?.name ?? null,
    roles: req.user?.roles ?? [],
  });
});

/**
 * Example protected endpoint
 */
router.get("/secure-example", (_req: Request, res: Response) => {
  res.json({ secret: "you are authenticated 🎉" });
});

export default router;
