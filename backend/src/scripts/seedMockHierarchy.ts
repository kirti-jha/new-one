import "dotenv/config";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findOrCreateUser(params: {
  email: string;
  fullName: string;
  role: "super_distributor" | "master_distributor" | "distributor" | "retailer";
  parentProfileId: string | null;
  balance: number;
  eWalletBalance?: number;
  passwordHash: string;
}) {
  const existing = await prisma.authUser.findUnique({
    where: { email: params.email.toLowerCase() },
  });

  if (existing) {
    const profile = await prisma.profile.findUnique({ where: { userId: existing.userId } });
    if (profile) return { created: false, profile, email: params.email, role: params.role, name: params.fullName };
  }

  const userId = randomUUID();
  await prisma.authUser.create({
    data: {
      userId,
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      isActive: true,
    },
  });
  const profile = await prisma.profile.create({
    data: {
      userId,
      fullName: params.fullName,
      phone: "9999999999",
      businessName: `${params.fullName} Business`,
      parentId: params.parentProfileId,
      status: "active",
      kycStatus: "verified",
    },
  });
  await prisma.userRole.create({
    data: { userId, role: params.role },
  });
  await prisma.wallet.create({
    data: {
      userId,
      balance: params.balance,
      eWalletBalance: params.eWalletBalance || 0,
    },
  });

  return { created: true, profile, email: params.email, role: params.role, name: params.fullName };
}

async function main() {
  const basePassword = "Test@12345";
  const passwordHash = await bcrypt.hash(basePassword, 10);
  const created: Array<{ email: string; role: string; name: string }> = [];

  const sd1 = await findOrCreateUser({
    email: "sd1.mock@abheepay.local",
    fullName: "Mock Super Distributor 1",
    role: "super_distributor",
    parentProfileId: null,
    balance: 250000,
    passwordHash,
  });
  if (sd1.created) created.push({ email: sd1.email, role: sd1.role, name: sd1.name });

  const sd2 = await findOrCreateUser({
    email: "sd2.mock@abheepay.local",
    fullName: "Mock Super Distributor 2",
    role: "super_distributor",
    parentProfileId: null,
    balance: 220000,
    passwordHash,
  });
  if (sd2.created) created.push({ email: sd2.email, role: sd2.role, name: sd2.name });

  const md1 = await findOrCreateUser({
    email: "md1.mock@abheepay.local",
    fullName: "Mock Master Distributor 1",
    role: "master_distributor",
    parentProfileId: sd1.profile.id,
    balance: 150000,
    passwordHash,
  });
  if (md1.created) created.push({ email: md1.email, role: md1.role, name: md1.name });

  const md2 = await findOrCreateUser({
    email: "md2.mock@abheepay.local",
    fullName: "Mock Master Distributor 2",
    role: "master_distributor",
    parentProfileId: sd1.profile.id,
    balance: 135000,
    passwordHash,
  });
  if (md2.created) created.push({ email: md2.email, role: md2.role, name: md2.name });

  const md3 = await findOrCreateUser({
    email: "md3.mock@abheepay.local",
    fullName: "Mock Master Distributor 3",
    role: "master_distributor",
    parentProfileId: sd2.profile.id,
    balance: 145000,
    passwordHash,
  });
  if (md3.created) created.push({ email: md3.email, role: md3.role, name: md3.name });

  const d1 = await findOrCreateUser({
    email: "d1.mock@abheepay.local",
    fullName: "Mock Distributor 1",
    role: "distributor",
    parentProfileId: md1.profile.id,
    balance: 80000,
    passwordHash,
  });
  if (d1.created) created.push({ email: d1.email, role: d1.role, name: d1.name });

  const d2 = await findOrCreateUser({
    email: "d2.mock@abheepay.local",
    fullName: "Mock Distributor 2",
    role: "distributor",
    parentProfileId: md1.profile.id,
    balance: 76000,
    passwordHash,
  });
  if (d2.created) created.push({ email: d2.email, role: d2.role, name: d2.name });

  const d3 = await findOrCreateUser({
    email: "d3.mock@abheepay.local",
    fullName: "Mock Distributor 3",
    role: "distributor",
    parentProfileId: md2.profile.id,
    balance: 69000,
    passwordHash,
  });
  if (d3.created) created.push({ email: d3.email, role: d3.role, name: d3.name });

  const d4 = await findOrCreateUser({
    email: "d4.mock@abheepay.local",
    fullName: "Mock Distributor 4",
    role: "distributor",
    parentProfileId: md3.profile.id,
    balance: 72000,
    passwordHash,
  });
  if (d4.created) created.push({ email: d4.email, role: d4.role, name: d4.name });

  const retailers = [
    { email: "r1.mock@abheepay.local", name: "Mock Retailer 1", parent: d1.profile.id, bal: 18000, e: 1000 },
    { email: "r2.mock@abheepay.local", name: "Mock Retailer 2", parent: d1.profile.id, bal: 17000, e: 900 },
    { email: "r3.mock@abheepay.local", name: "Mock Retailer 3", parent: d2.profile.id, bal: 15000, e: 800 },
    { email: "r4.mock@abheepay.local", name: "Mock Retailer 4", parent: d2.profile.id, bal: 14000, e: 700 },
    { email: "r5.mock@abheepay.local", name: "Mock Retailer 5", parent: d3.profile.id, bal: 16000, e: 750 },
    { email: "r6.mock@abheepay.local", name: "Mock Retailer 6", parent: d3.profile.id, bal: 13000, e: 650 },
    { email: "r7.mock@abheepay.local", name: "Mock Retailer 7", parent: d4.profile.id, bal: 12000, e: 600 },
    { email: "r8.mock@abheepay.local", name: "Mock Retailer 8", parent: d4.profile.id, bal: 11000, e: 500 },
  ];

  for (const r of retailers) {
    const row = await findOrCreateUser({
      email: r.email,
      fullName: r.name,
      role: "retailer",
      parentProfileId: r.parent,
      balance: r.bal,
      eWalletBalance: r.e,
      passwordHash,
    });
    if (row.created) created.push({ email: row.email, role: row.role, name: row.name });
  }

  console.log(JSON.stringify({
    success: true,
    message: "Mock hierarchy seed complete",
    created_count: created.length,
    created_users: created,
    login_password_for_all_mock_users: basePassword,
  }, null, 2));
}

main()
  .catch((err) => {
    console.error("seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
