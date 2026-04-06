import { Router } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { requirePermission } from "../middleware/permissions";
import { ensureServiceConfigSeed } from "../lib/ensureServiceConfigSeed";

const router = Router();

async function getRecursiveDownlineProfiles(rootProfileId: string) {
  const collected: any[] = [];
  let currentParentIds: string[] = [rootProfileId];

  while (currentParentIds.length > 0) {
    const batch = await prisma.profile.findMany({
      where: { parentId: { in: currentParentIds }, status: "active" },
      orderBy: { createdAt: "desc" },
    });
    if (batch.length === 0) break;
    collected.push(...batch);
    currentParentIds = batch.map((p) => p.id);
  }

  return collected;
}

// GET /api/users — get my downline users
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Get my profile to find my profile ID
    const myProfile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
    if (!myProfile) return res.status(404).json({ error: "Profile not found" });

    const myRole = await prisma.userRole.findFirst({ where: { userId: req.userId! } });

    let profiles;
    if (myRole?.role === "admin") {
      // Admin sees all users
      profiles = await prisma.profile.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Non-admin sees full recursive downline (all descendants)
      profiles = await getRecursiveDownlineProfiles(myProfile.id);
    }

    // Get roles for each user
    const userIds = profiles.map(p => p.userId);
    const roles = await prisma.userRole.findMany({ where: { userId: { in: userIds } } });
    const roleMap = new Map(roles.map(r => [r.userId, r.role]));

    // Get wallets
    const wallets = await prisma.wallet.findMany({ where: { userId: { in: userIds } } });
    const walletMap = new Map(wallets.map(w => [w.userId, w.balance]));

    const result = profiles.map(p => ({
      ...p,
      role: roleMap.get(p.userId),
      walletBalance: walletMap.get(p.userId) ?? 0,
    }));

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/users/downline — list downline users for selects (wallet transfer / commissions)
router.get("/downline", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [myProfile, myRole] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: req.userId! } }),
      prisma.userRole.findFirst({ where: { userId: req.userId! } }),
    ]);
    if (!myProfile || !myRole) return res.status(404).json({ error: "Profile not found" });

    let profiles;
    if (myRole.role === "admin") {
      profiles = await prisma.profile.findMany({
        where: { status: "active", userId: { not: req.userId! } },
        orderBy: { fullName: "asc" },
      });
    } else {
      profiles = await getRecursiveDownlineProfiles(myProfile.id);
    }

    const userIds = profiles.map((p) => p.userId);
    const roles = await prisma.userRole.findMany({ where: { userId: { in: userIds } } });
    const roleMap = new Map(roles.map((r) => [r.userId, r.role]));

    const result = profiles
      .map((p) => ({
        user_id: p.userId,
        full_name: p.fullName,
        role: roleMap.get(p.userId) || "retailer",
      }))
      .sort((a, b) => String(a.full_name || "").localeCompare(String(b.full_name || ""), "en"));

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/users/profile — get my own profile
router.get("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
    const role = await prisma.userRole.findFirst({ where: { userId: req.userId! } });
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.userId! } });
    res.json({ ...profile, role: role?.role, walletBalance: wallet?.balance });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/users/profile — update own profile
router.patch("/profile", requireAuth, async (req: AuthRequest, res) => {
  const {
    full_name,
    phone,
    business_name,
    bank_name,
    bank_account_number,
    bank_ifsc,
    bank_account_holder,
    aadhaar_image_path,
    pan_image_path,
  } = req.body;
  try {
    const profile = await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        fullName: full_name,
        phone,
        businessName: business_name,
        bankName: bank_name,
        bankAccountNumber: bank_account_number,
        bankIfsc: bank_ifsc,
        bankAccountHolder: bank_account_holder,
        ...(aadhaar_image_path !== undefined ? { aadhaarImagePath: aadhaar_image_path } : {}),
        ...(pan_image_path !== undefined ? { panImagePath: pan_image_path } : {}),
      },
    });
    res.json(profile);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/users/services — get enabled services for me
router.get("/services", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    await ensureServiceConfigSeed(prisma);

    // Get all enabled services globally
    const services = await prisma.serviceConfig.findMany({
      where: { isEnabled: true },
      orderBy: { serviceLabel: "asc" },
    });

    // Get user-specific overrides
    const overrides = await prisma.userServiceOverride.findMany({
      where: { userId },
    });

    const disabledKeys = new Set(
      overrides.filter(o => !o.isEnabled).map(o => o.serviceKey)
    );

    const filteredServices = services.filter(s => !disabledKeys.has(s.serviceKey));

    res.json(filteredServices);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/users/:target_id/services — get services for a specific user (admin/parent only)
router.get("/:target_id/services", requireAuth, async (req: AuthRequest, res) => {
  const { target_id } = req.params;
  try {
    await ensureServiceConfigSeed(prisma);
    const [services, overrides] = await Promise.all([
      prisma.serviceConfig.findMany({ orderBy: { serviceLabel: "asc" } }),
      prisma.userServiceOverride.findMany({ where: { userId: target_id } }),
    ]);

    const overrideMap = new Set(overrides.filter(o => !o.isEnabled).map(o => o.serviceKey));
    const result = services.map(s => ({
      service_key: s.serviceKey,
      service_label: s.serviceLabel,
      is_enabled: s.isEnabled,
      user_disabled: overrideMap.has(s.serviceKey),
    }));

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/users/manage — handle various user management actions
router.post("/manage", requireAuth, async (req: AuthRequest, res) => {
  const { action, target_user_id, ...params } = req.body;
  const callerId = req.userId!;

  if (!action || !target_user_id) {
    return res.status(400).json({ error: "action and target_user_id required" });
  }

  try {
    const [callerRole, targetRole, callerProfile, targetProfile] = await Promise.all([
      prisma.userRole.findFirst({ where: { userId: callerId } }),
      prisma.userRole.findFirst({ where: { userId: target_user_id } }),
      prisma.profile.findUnique({ where: { userId: callerId } }),
      prisma.profile.findUnique({ where: { userId: target_user_id } }),
    ]);

    if (!callerRole || !targetRole || !callerProfile || !targetProfile) {
      return res.status(404).json({ error: "User or role not found" });
    }

    const ROLE_LEVEL: Record<string, number> = {
      admin: 1, super_distributor: 2, master_distributor: 3, distributor: 4, retailer: 5,
    };

    // Hierarchy Check for non-admins
    if (callerRole.role !== "admin") {
      const callerLevel = ROLE_LEVEL[callerRole.role as string] || 99;
      const targetLevel = ROLE_LEVEL[targetRole.role as string] || 99;

      if (callerLevel >= targetLevel) {
        return res.status(403).json({ error: "Cannot manage users at or above your level" });
      }

      // Recursive check: is callerId an ancestor of targetProfile.id?
      let currentParentId = targetProfile.parentId;
      let isAncestor = false;
      while (currentParentId) {
        if (currentParentId === callerProfile.id) {
          isAncestor = true;
          break;
        }
        const parent = await prisma.profile.findUnique({ where: { id: currentParentId }, select: { parentId: true } });
        currentParentId = parent?.parentId || null;
      }

      if (!isAncestor) {
        return res.status(403).json({ error: "Target user is not in your downline" });
      }
    }

    // --- Granular Permission Checks for Admins ---
    if (callerRole.role === "admin" && !callerProfile.isMasterAdmin) {
      const permMap: Record<string, string> = {
        edit_profile: "canEditUsers",
        change_role: "canChangeUserRoles",
        block: "canBlockUsers",
        unblock: "canBlockUsers",
        toggle_service: "canManageUserServices",
        update_documents: "canEditUsers", // or canViewUserDocs
        delete: "canDeleteUsers",
        reset_password: "canResetUserPasswords",
        impersonate: "canManageSecurity", // Impersonation is high security
      };

      const requiredPerm = permMap[action];
      if (requiredPerm) {
        const perms = await prisma.staffPermission.findUnique({ where: { userId: callerId } });
        if (!perms || !(perms as any)[requiredPerm]) {
          return res.status(403).json({ error: "Permission denied", requiredPermission: requiredPerm });
        }
      }
    }

    // Action handling
    switch (action) {
      case "edit_profile": {
        const { full_name, phone, business_name } = params;
        await prisma.profile.update({
          where: { userId: target_user_id },
          data: {
            fullName: full_name?.trim(),
            phone: phone?.trim(),
            businessName: business_name?.trim(),
          },
        });
        return res.json({ success: true, message: "Profile updated" });
      }

      case "change_role": {
        if (callerRole.role !== "admin") return res.status(403).json({ error: "Only admins can change roles" });
        const { new_role } = params;
        await prisma.userRole.updateMany({
          where: { userId: target_user_id },
          data: { role: new_role },
        });
        return res.json({ success: true, message: `Role changed to ${new_role}` });
      }

      case "block": {
        await prisma.profile.update({
          where: { userId: target_user_id },
          data: { status: "blocked" },
        });
        return res.json({ success: true, message: "User status set to blocked" });
      }

      case "unblock": {
        await prisma.profile.update({
          where: { userId: target_user_id },
          data: { status: "active" },
        });
        return res.json({ success: true, message: "User status set to active" });
      }

      case "toggle_service": {
        const { service_key, is_enabled } = params;
        if (is_enabled) {
          await prisma.userServiceOverride.deleteMany({
            where: { userId: target_user_id, serviceKey: service_key },
          });
        } else {
          await prisma.userServiceOverride.upsert({
            where: { userId_serviceKey: { userId: target_user_id, serviceKey: service_key } },
            create: { userId: target_user_id, serviceKey: service_key, isEnabled: false, disabledBy: callerId },
            update: { isEnabled: false, disabledBy: callerId },
          });
        }
        return res.json({ success: true, message: `Service ${service_key} toggled` });
      }

      case "update_documents": {
        const { aadhaar_image_path, pan_image_path } = params;
        await prisma.profile.update({
          where: { userId: target_user_id },
          data: {
            ...(aadhaar_image_path !== undefined ? { aadhaarImagePath: aadhaar_image_path } : {}),
            ...(pan_image_path !== undefined ? { panImagePath: pan_image_path } : {}),
          },
        });
        return res.json({ success: true, message: "Document paths updated" });
      }

      case "delete": {
        if (callerRole.role !== "admin") return res.status(403).json({ error: "Only admins can delete users" });

        const targetWallet = await prisma.wallet.findUnique({ where: { userId: target_user_id } });
        if (targetWallet && Number(targetWallet.balance) > 0) {
          return res.status(400).json({ error: "Cannot delete user with non-zero wallet balance" });
        }

        await prisma.$transaction(async (tx) => {
          // 1. Service overrides
          await tx.userServiceOverride.deleteMany({ where: { userId: target_user_id } });
          // 2. Roles
          await tx.userRole.deleteMany({ where: { userId: target_user_id } });
          // 3. Wallet
          await tx.wallet.deleteMany({ where: { userId: target_user_id } });
          // 4. Profile
          await tx.profile.deleteMany({ where: { userId: target_user_id } });
          // 5. AuthUser
          await tx.authUser.deleteMany({ where: { userId: target_user_id } });
        });

        return res.json({ success: true, message: "User deleted successfully" });
      }

      case "impersonate": {
        if (callerRole.role !== "admin") return res.status(403).json({ error: "Only admins can impersonate" });
        const secret = process.env.BACKEND_JWT_SECRET || "dev_backend_secret_change_me";
        const accessToken = jwt.sign({ sub: target_user_id, typ: "access" }, secret, { expiresIn: "2h" });
        const targetAuth = await prisma.authUser.findUnique({ where: { userId: target_user_id } });
        return res.json({
          success: true,
          message: "Impersonation session ready",
          access_token: accessToken,
          user_id: target_user_id,
          email: targetAuth?.email || "",
        });
      }

      case "reset_password": {
        if (callerRole.role !== "admin") return res.status(403).json({ error: "Only admins can reset passwords" });
        const newPassword = String(params.new_password || "");
        if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await prisma.authUser.update({
          where: { userId: target_user_id },
          data: { passwordHash },
        });
        return res.json({ success: true, message: "Password reset successful (simulated)" });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/users — creation of a new user
router.post("/", requireAuth, requirePermission("canCreateUsers"), async (req: AuthRequest, res) => {
  const { email, password, full_name, role, parent_id, ...extra } = req.body;
  try {
    const callerRole = await prisma.userRole.findFirst({ where: { userId: req.userId! } });
    if (!callerRole) return res.status(403).json({ error: "Forbidden" });

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "Valid email and password are required" });
    }

    const existing = await prisma.authUser.findUnique({ where: { email: String(email).toLowerCase() } });
    if (existing) return res.status(409).json({ error: "Email already exists" });

    const tempId = randomUUID();
    const passwordHash = await bcrypt.hash(String(password), 10);

    const result = await prisma.$transaction(async (tx) => {
      await tx.authUser.create({
        data: {
          userId: tempId,
          email: String(email).toLowerCase(),
          passwordHash,
          isActive: true,
        },
      });
      const profile = await tx.profile.create({
        data: {
          userId: tempId,
          fullName: full_name,
          phone: extra.phone,
          businessName: extra.business_name,
          parentId: parent_id,
          status: "active",
          kycStatus: "pending",
          aadhaarNumber: extra.aadhaar_number,
          panNumber: extra.pan_number,
          bankName: extra.bank_name,
          bankAccountNumber: extra.bank_account_number,
          bankIfsc: extra.bank_ifsc,
          bankAccountHolder: extra.bank_account_holder,
          aadhaarImagePath: extra.aadhaar_image_path,
          panImagePath: extra.pan_image_path,
        },
      });
      await tx.userRole.create({
        data: { userId: tempId, role: role || "retailer" },
      });
      await tx.wallet.create({
        data: { userId: tempId, balance: 0 },
      });
      return profile;
    });

    res.json({ success: true, user: { id: tempId }, profile: result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/users/seed-mock-hierarchy — create mock users across full hierarchy for testing
router.post("/seed-mock-hierarchy", requireAuth, async (req: AuthRequest, res) => {
  try {
    const callerRole = await prisma.userRole.findFirst({ where: { userId: req.userId! } });
    const callerProfile = await prisma.profile.findUnique({
      where: { userId: req.userId! },
      select: { isMasterAdmin: true },
    });
    if (callerRole?.role !== "admin" || !callerProfile?.isMasterAdmin) {
      return res.status(403).json({ error: "Only master admin can seed mock hierarchy" });
    }

    const basePassword = "Test@12345";
    const passwordHash = await bcrypt.hash(basePassword, 10);

    const created: Array<{ email: string; role: string; name: string }> = [];

    const findOrCreateUser = async (
      email: string,
      fullName: string,
      role: "super_distributor" | "master_distributor" | "distributor" | "retailer",
      parentProfileId: string | null,
      balance: number,
      eWalletBalance = 0
    ) => {
      const normalizedEmail = email.toLowerCase();
      const existingAuth = await prisma.authUser.findUnique({ where: { email: normalizedEmail } });
      if (existingAuth) {
        const existingProfile = await prisma.profile.findUnique({ where: { userId: existingAuth.userId } });
        if (existingProfile) return existingProfile;
      }

      const userId = randomUUID();
      const profile = await prisma.$transaction(async (tx) => {
        await tx.authUser.create({
          data: {
            userId,
            email: normalizedEmail,
            passwordHash,
            isActive: true,
          },
        });
        const p = await tx.profile.create({
          data: {
            userId,
            fullName,
            phone: "9999999999",
            businessName: `${fullName} Business`,
            parentId: parentProfileId,
            status: "active",
            kycStatus: "verified",
          },
        });
        await tx.userRole.create({
          data: { userId, role },
        });
        await tx.wallet.create({
          data: { userId, balance, eWalletBalance },
        });
        return p;
      });

      created.push({ email: normalizedEmail, role, name: fullName });
      return profile;
    };

    const sd1 = await findOrCreateUser(
      "sd1.mock@abheepay.local",
      "Mock Super Distributor 1",
      "super_distributor",
      null,
      250000
    );
    const sd2 = await findOrCreateUser(
      "sd2.mock@abheepay.local",
      "Mock Super Distributor 2",
      "super_distributor",
      null,
      220000
    );

    const md1 = await findOrCreateUser(
      "md1.mock@abheepay.local",
      "Mock Master Distributor 1",
      "master_distributor",
      sd1.id,
      150000
    );
    const md2 = await findOrCreateUser(
      "md2.mock@abheepay.local",
      "Mock Master Distributor 2",
      "master_distributor",
      sd1.id,
      135000
    );
    const md3 = await findOrCreateUser(
      "md3.mock@abheepay.local",
      "Mock Master Distributor 3",
      "master_distributor",
      sd2.id,
      145000
    );

    const d1 = await findOrCreateUser(
      "d1.mock@abheepay.local",
      "Mock Distributor 1",
      "distributor",
      md1.id,
      80000
    );
    const d2 = await findOrCreateUser(
      "d2.mock@abheepay.local",
      "Mock Distributor 2",
      "distributor",
      md1.id,
      76000
    );
    const d3 = await findOrCreateUser(
      "d3.mock@abheepay.local",
      "Mock Distributor 3",
      "distributor",
      md2.id,
      69000
    );
    const d4 = await findOrCreateUser(
      "d4.mock@abheepay.local",
      "Mock Distributor 4",
      "distributor",
      md3.id,
      72000
    );

    await findOrCreateUser("r1.mock@abheepay.local", "Mock Retailer 1", "retailer", d1.id, 18000, 1000);
    await findOrCreateUser("r2.mock@abheepay.local", "Mock Retailer 2", "retailer", d1.id, 17000, 900);
    await findOrCreateUser("r3.mock@abheepay.local", "Mock Retailer 3", "retailer", d2.id, 15000, 800);
    await findOrCreateUser("r4.mock@abheepay.local", "Mock Retailer 4", "retailer", d2.id, 14000, 700);
    await findOrCreateUser("r5.mock@abheepay.local", "Mock Retailer 5", "retailer", d3.id, 16000, 750);
    await findOrCreateUser("r6.mock@abheepay.local", "Mock Retailer 6", "retailer", d3.id, 13000, 650);
    await findOrCreateUser("r7.mock@abheepay.local", "Mock Retailer 7", "retailer", d4.id, 12000, 600);
    await findOrCreateUser("r8.mock@abheepay.local", "Mock Retailer 8", "retailer", d4.id, 11000, 500);

    res.json({
      success: true,
      message: "Mock hierarchy seed complete",
      password_for_all_new_users: basePassword,
      created_count: created.length,
      created_users: created,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
