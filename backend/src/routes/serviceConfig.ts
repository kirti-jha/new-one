import { Router } from "express";
import { prisma } from "../index";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { ensureServiceConfigSeed } from "../lib/ensureServiceConfigSeed";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  try {
    await ensureServiceConfigSeed(prisma);
    const services = await prisma.serviceConfig.findMany({ orderBy: { serviceLabel: "asc" } });
    res.json(services);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const role = await prisma.userRole.findFirst({ where: { userId: req.userId! } });
    if (role?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.serviceConfig.update({
      where: { id: req.params.id },
      data: {
        isEnabled: req.body?.is_enabled,
      },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
