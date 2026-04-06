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
              id: (permMap.get(p.userId) as any).id,
              // Section Masters
              can_manage_users: (permMap.get(p.userId) as any).canManageUsers,
              can_manage_finance: (permMap.get(p.userId) as any).canManageFinance,
              can_manage_commissions: (permMap.get(p.userId) as any).canManageCommissions,
              can_manage_services: (permMap.get(p.userId) as any).canManageServices,
              can_manage_support: (permMap.get(p.userId) as any).canManageSupport,
              // Users
              can_create_users: (permMap.get(p.userId) as any).canCreateUsers,
              can_edit_users: (permMap.get(p.userId) as any).canEditUsers,
              can_block_users: (permMap.get(p.userId) as any).canBlockUsers,
              can_delete_users: (permMap.get(p.userId) as any).canDeleteUsers,
              can_manage_user_services: (permMap.get(p.userId) as any).canManageUserServices,
              can_change_user_roles: (permMap.get(p.userId) as any).canChangeUserRoles,
              can_reset_user_passwords: (permMap.get(p.userId) as any).canResetUserPasswords,
              can_view_user_docs: (permMap.get(p.userId) as any).canViewUserDocs,
              // Finance
              can_approve_fund_requests: (permMap.get(p.userId) as any).canApproveFundRequests,
              can_reject_fund_requests: (permMap.get(p.userId) as any).canRejectFundRequests,
              can_manage_bank_accounts: (permMap.get(p.userId) as any).canManageBankAccounts,
              can_view_transactions: (permMap.get(p.userId) as any).canViewTransactions,
              can_perform_wallet_transfer: (permMap.get(p.userId) as any).canPerformWalletTransfer,
              // Others
              can_manage_global_services: (permMap.get(p.userId) as any).canManageGlobalServices,
              can_manage_settings: (permMap.get(p.userId) as any).canManageSettings,
              can_manage_security: (permMap.get(p.userId) as any).canManageSecurity,
              can_reply_support_tickets: (permMap.get(p.userId) as any).canReplySupportTickets,
              can_view_reports: (permMap.get(p.userId) as any).canViewReports,
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
    const p = req.body?.permissions || {};

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
        data: { userId, role: "admin" as any },
      });
      await tx.wallet.create({
        data: { userId, balance: 0, eWalletBalance: 0 },
      });
      await (tx.staffPermission as any).create({
        data: {
          userId,
          grantedBy: req.userId!,
          // Section Masters
          canManageUsers: !!p.can_manage_users,
          canManageFinance: !!p.can_manage_finance,
          canManageCommissions: !!p.can_manage_commissions,
          canManageServices: !!p.can_manage_services,
          canManageSupport: !!p.can_manage_support,
          // Users
          canCreateUsers: !!p.can_create_users,
          canEditUsers: !!p.can_edit_users,
          canBlockUsers: !!p.can_block_users,
          canDeleteUsers: !!p.can_delete_users,
          canManageUserServices: !!p.can_manage_user_services,
          canChangeUserRoles: !!p.can_change_user_roles,
          canResetUserPasswords: !!p.can_reset_user_passwords,
          canViewUserDocs: p.can_view_user_docs !== false,
          // Finance
          canApproveFundRequests: !!p.can_approve_fund_requests,
          canRejectFundRequests: !!p.can_reject_fund_requests,
          canManageBankAccounts: !!p.can_manage_bank_accounts,
          canViewTransactions: p.can_view_transactions !== false,
          canPerformWalletTransfer: !!p.can_perform_wallet_transfer,
          // Others
          canManageGlobalServices: !!p.can_manage_global_services,
          canManageSettings: !!p.can_manage_settings,
          canManageSecurity: !!p.can_manage_security,
          canReplySupportTickets: p.can_reply_support_tickets !== false,
          canViewReports: p.can_view_reports !== false,
        },
      });
    }, {
      timeout: 15000,
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
    const updated = await (prisma.staffPermission as any).upsert({
      where: { userId: targetUserId },
      create: {
        userId: targetUserId,
        grantedBy: req.userId!,
        // Section Masters
        canManageUsers: !!p.can_manage_users,
        canManageFinance: !!p.can_manage_finance,
        canManageCommissions: !!p.can_manage_commissions,
        canManageServices: !!p.can_manage_services,
        canManageSupport: !!p.can_manage_support,
        // Users
        canCreateUsers: !!p.can_create_users,
        canEditUsers: !!p.can_edit_users,
        canBlockUsers: !!p.can_block_users,
        canDeleteUsers: !!p.can_delete_users,
        canManageUserServices: !!p.can_manage_user_services,
        canChangeUserRoles: !!p.can_change_user_roles,
        canResetUserPasswords: !!p.can_reset_user_passwords,
        canViewUserDocs: p.can_view_user_docs !== false,
        // Finance
        canApproveFundRequests: !!p.can_approve_fund_requests,
        canRejectFundRequests: !!p.can_reject_fund_requests,
        canManageBankAccounts: !!p.can_manage_bank_accounts,
        canViewTransactions: p.can_view_transactions !== false,
        canPerformWalletTransfer: !!p.can_perform_wallet_transfer,
        // Others
        canManageGlobalServices: !!p.can_manage_global_services,
        canManageSettings: !!p.can_manage_settings,
        canManageSecurity: !!p.can_manage_security,
        canReplySupportTickets: p.can_reply_support_tickets !== false,
        canViewReports: p.can_view_reports !== false,
      },
      update: {
        grantedBy: req.userId!,
        // Section Masters
        canManageUsers: !!p.can_manage_users,
        canManageFinance: !!p.can_manage_finance,
        canManageCommissions: !!p.can_manage_commissions,
        canManageServices: !!p.can_manage_services,
        canManageSupport: !!p.can_manage_support,
        // Users
        canCreateUsers: !!p.can_create_users,
        canEditUsers: !!p.can_edit_users,
        canBlockUsers: !!p.can_block_users,
        canDeleteUsers: !!p.can_delete_users,
        canManageUserServices: !!p.can_manage_user_services,
        canChangeUserRoles: !!p.can_change_user_roles,
        canResetUserPasswords: !!p.can_reset_user_passwords,
        canViewUserDocs: p.can_view_user_docs !== false,
        // Finance
        canApproveFundRequests: !!p.can_approve_fund_requests,
        canRejectFundRequests: !!p.can_reject_fund_requests,
        canManageBankAccounts: !!p.can_manage_bank_accounts,
        canViewTransactions: p.can_view_transactions !== false,
        canPerformWalletTransfer: !!p.can_perform_wallet_transfer,
        // Others
        canManageGlobalServices: !!p.can_manage_global_services,
        canManageSettings: !!p.can_manage_settings,
        canManageSecurity: !!p.can_manage_security,
        canReplySupportTickets: p.can_reply_support_tickets !== false,
        canViewReports: p.can_view_reports !== false,
      },
    });

    res.json({ success: true, id: updated.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
