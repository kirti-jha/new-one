import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Middleware: Verify if user has a specific granular permission.
 * Super Admins (isMasterAdmin: true) bypass all checks.
 */
export function requirePermission(permissionField: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // 1. Check if user is Super Admin
      const profile = await prisma.profile.findUnique({
        where: { userId: req.userId },
        select: { isMasterAdmin: true },
      });

      if (profile?.isMasterAdmin) {
        return next();
      }

      // 2. Fetch all permissions
      const perms = await prisma.staffPermission.findUnique({
        where: { userId: req.userId },
      });

      if (!perms) {
        return res.status(403).json({ error: "No permissions defined for this user" });
      }

      // 3. Define Master-Child relationships
      const masterMap: Record<string, string> = {
        // Users Section
        canCreateUsers: "canManageUsers",
        canEditUsers: "canManageUsers",
        canBlockUsers: "canManageUsers",
        canDeleteUsers: "canManageUsers",
        canManageUserServices: "canManageUsers",
        canChangeUserRoles: "canManageUsers",
        canResetUserPasswords: "canManageUsers",
        canViewUserDocs: "canManageUsers",
        // Finance Section
        canApproveFundRequests: "canManageFinance",
        canRejectFundRequests: "canManageFinance",
        canManageBankAccounts: "canManageFinance",
        canViewTransactions: "canManageFinance",
        canPerformWalletTransfer: "canManageFinance",
        // Others
        canManageGlobalServices: "canManageServices",
        canManageSettings: "canManageServices",
        canManageSecurity: "canManageServices",
        canReplySupportTickets: "canManageSupport",
        canViewReports: "canManageSupport",
      };

      const masterField = masterMap[permissionField];
      const isMasterAllowed = masterField ? (perms as any)[masterField] : true;
      const isGranularAllowed = (perms as any)[permissionField];

      if (!isMasterAllowed || !isGranularAllowed) {
        return res.status(403).json({
          error: "Permission denied",
          requiredPermission: permissionField,
          requiresMaster: masterField || "none",
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({ error: "Internal server error during permission check" });
    }
  };
}
