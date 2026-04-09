import { Router } from "express";
import { prisma } from "../index";

const router = Router();

// GET /api/db/status — verify database connectivity and return auth user list
router.get("/status", async (_req, res) => {
  try {
    const users = await prisma.authUser.findMany({
      select: {
        userId: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json({
      status: "ok",
      db: "connected",
      userCount: users.length,
      users,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      db: "disconnected",
      message: error?.message || "Database connection failed",
    });
  }
});

// GET /api/db/ping — simple route without any database call
router.get("/ping", (_req, res) => {
  res.json({
    status: "ok",
    message: "pong",
  });
});

export default router;
