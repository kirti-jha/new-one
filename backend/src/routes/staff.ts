import { Router } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../index";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

async function requireMasterAdmin(userId: string) {
  const [role, profile] = await Promise.all([
    prisma.userRole.findFirst({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId }, select: { isMasterAdmin: true } }),
  ]);

  return role?.role === "admin" && profile?.isMasterAdmin === true;
}

router.get("/admins", requireAuth, async (req: AuthRequest, res) => {
  try {
    const isMaster = await requireMasterAdmin(req.userId!);
    if (!isMaster) return res.status(403).json({ error: "Only master admin can access staff management" });

    const roles = await prisma.userRole.findMany({
      where: { role: "admin" },
      select: { userId: true },
    });
    const adminIds = roles.map((r) => r.userId);
    if (adminIds.length === 0) return res.json([]);

    const [profiles, perms] = await Promise.all([
      prisma.profile.findMany({
        where: { userId: { in: adminIds } },
        select: { userId: true, fullName: true, isMasterAdmin: true },
      }),
      prisma.staffPermission.findMany({
        where: { userId: { in: adminIds } },
      }),
    ]);

    const permMap = new Map(perms.map((p) => [p.userId, p]));
    const result = profiles
      .map((p) => ({
        user_id: p.userId,
        full_name: p.fullName,
        is_master_admin: p.isMasterAdmin,
        permissions: permMap.get(p.userId)
          ? {
              id: permMap.get(p.userId)!.id,
              can_manage_users: permMap.get(p.userId)!.canManageUsers,
              can_manage_finances: permMap.get(p.userId)!.canManageFinances,
              can_manage_commissions: permMap.get(p.userId)!.canManageCommissions,
              can_manage_services: permMap.get(p.userId)!.canManageServices,
              can_manage_settings: permMap.get(p.userId)!.canManageSettings,
              can_manage_security: permMap.get(p.userId)!.canManageSecurity,
              can_view_reports: permMap.get(p.userId)!.canViewReports,
            }
          : null,
      }))
      .sort((a, b) => Number(b.is_master_admin) - Number(a.is_master_admin));

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/admins", requireAuth, async (req: AuthRequest, res) => {
  try {
    const isMaster = await requireMasterAdmin(req.userId!);
    if (!isMaster) return res.status(403).json({ error: "Only master admin can create staff admins" });

    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const fullName = String(req.body?.full_name || "").trim();
    const phone = String(req.body?.phone || "").trim();
    const permissions = req.body?.permissions || {};

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "email, password, full_name are required" });
    }
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await prisma.authUser.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already exists" });

    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.authUser.create({
        data: { userId, email, passwordHash, isActive: true },
      });
      await tx.profile.create({
        data: {
          userId,
          fullName,
          phone: phone || null,
          status: "active",
          kycStatus: "pending",
          isMasterAdmin: false,
        },
      });
      await tx.userRole.create({
        data: { userId, role: "admin" },
      });
      await tx.wallet.create({
        data: { userId, balance: 0, eWalletBalance: 0 },
      });
      await tx.staffPermission.create({
        data: {
          userId,
          grantedBy: req.userId!,
          canManageUsers: !!permissions.can_manage_users,
          canManageFinances: !!permissions.can_manage_finances,
          canManageCommissions: !!permissions.can_manage_commissions,
          canManageServices: !!permissions.can_manage_services,
          canManageSettings: !!permissions.can_manage_settings,
          canManageSecurity: !!permissions.can_manage_security,
          canViewReports: !!permissions.can_view_reports,
        },
      });
    });

    res.json({ success: true, user_id: userId });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/permissions/:userId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const isMaster = await requireMasterAdmin(req.userId!);
    if (!isMaster) return res.status(403).json({ error: "Only master admin can update permissions" });

    const targetUserId = req.params.userId;
    const targetProfile = await prisma.profile.findUnique({
      where: { userId: targetUserId },
      select: { isMasterAdmin: true },
    });
    if (targetProfile?.isMasterAdmin) {
      return res.status(400).json({ error: "Cannot edit master admin permissions" });
    }

    const p = req.body || {};
    const updated = await prisma.staffPermission.upsert({
      where: { userId: targetUserId },
      create: {
        userId: targetUserId,
        grantedBy: req.userId!,
        canManageUsers: !!p.can_manage_users,
        canManageFinances: !!p.can_manage_finances,
        canManageCommissions: !!p.can_manage_commissions,
        canManageServices: !!p.can_manage_services,
        canManageSettings: !!p.can_manage_settings,
        canManageSecurity: !!p.can_manage_security,
        canViewReports: !!p.can_view_reports,
      },
      update: {
        canManageUsers: !!p.can_manage_users,
        canManageFinances: !!p.can_manage_finances,
        canManageCommissions: !!p.can_manage_commissions,
        canManageServices: !!p.can_manage_services,
        canManageSettings: !!p.can_manage_settings,
        canManageSecurity: !!p.can_manage_security,
        canViewReports: !!p.can_view_reports,
        grantedBy: req.userId!,
      },
    });

    res.json({ success: true, id: updated.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
