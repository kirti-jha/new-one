import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const EMAIL = "Admin@abheepay.com";
const PASSWORD = "Abheepay2022";
const FULL_NAME = "System Admin";

async function main() {
  console.log("Setting up new admin user...");

  try {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    const userId = randomUUID();

    console.log("Creating AuthUser...");
    await prisma.authUser.create({
        data: { userId, email: EMAIL.toLowerCase(), passwordHash, isActive: true },
    });
    
    console.log("Creating Profile...");
    await prisma.profile.create({
        data: {
            userId,
            fullName: FULL_NAME,
            status: "active",
            kycStatus: "verified",
            isMasterAdmin: true,
        },
    });

    console.log("Creating UserRole...");
    await prisma.userRole.create({
        data: { userId, role: "admin" },
    });

    console.log("Creating Wallet...");
    await prisma.wallet.create({
        data: { userId, balance: 0, eWalletBalance: 0 },
    });

    console.log(`Admin account created successfully!`);
    console.log(`Email: ${EMAIL}`);
    console.log(`Password: ${PASSWORD}`);
  } catch (error) {
    console.error("Error setting up admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
