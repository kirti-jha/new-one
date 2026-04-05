import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest<P = Record<string, any>, B = any, Q = any> extends Request<P, any, B, Q> {
  userId?: string;
  userRole?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const token = authHeader.split(" ")[1];
  const backendSecret = process.env.BACKEND_JWT_SECRET || "dev_backend_secret_change_me";
  try {
    const decoded = jwt.verify(token, backendSecret) as { sub?: string };
    if (!decoded?.sub) return res.status(401).json({ error: "Invalid token payload" });
    req.userId = decoded.sub;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware: Verifies user is admin role.
 */
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
  const { prisma } = await import("../index");
  const role = await prisma.userRole.findFirst({ where: { userId: req.userId } });
  if (role?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}
