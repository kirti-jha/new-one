import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../index";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/status", requireAuth, async (req: AuthRequest, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId! },
      select: { tpinHash: true },
    });
    res.json({ has_tpin: !!profile?.tpinHash });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/verify", requireAuth, async (req: AuthRequest, res) => {
  const tpin = String(req.body?.tpin || "");
  if (!tpin) return res.status(400).json({ error: "tpin is required" });

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId! },
      select: { tpinHash: true },
    });
    if (!profile?.tpinHash) return res.status(400).json({ error: "T-PIN not set" });

    const ok = await bcrypt.compare(tpin, profile.tpinHash);
    if (!ok) return res.status(401).json({ error: "Invalid T-PIN" });

    res.json({ valid: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/set", requireAuth, async (req: AuthRequest, res) => {
  const oldTpin = req.body?.old_tpin ? String(req.body.old_tpin) : "";
  const newTpin = String(req.body?.new_tpin || "");

  if (!/^\d{4,6}$/.test(newTpin)) {
    return res.status(400).json({ error: "T-PIN must be 4 to 6 digits" });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId! },
      select: { tpinHash: true },
    });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    if (profile.tpinHash) {
      if (!oldTpin) return res.status(400).json({ error: "Current T-PIN is required" });
      const ok = await bcrypt.compare(oldTpin, profile.tpinHash);
      if (!ok) return res.status(401).json({ error: "Current T-PIN is incorrect" });
    }

    const hashed = await bcrypt.hash(newTpin, 10);
    await prisma.profile.update({
      where: { userId: req.userId! },
      data: { tpinHash: hashed },
    });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
