import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding mock user hierarchy...");

  const basePassword = "Test@12345";
  const passwordHash = await bcrypt.hash(basePassword, 10);

  const findOrCreateUser = async (
    email: string,
    fullName: string,
    role: string,
    parentProfileId: string | null,
    balance: number,
    eWalletBalance = 0
  ) => {
    const normalizedEmail = email.toLowerCase();
    const existingAuth = await prisma.authUser.findUnique({ where: { email: normalizedEmail } });
    if (existingAuth) {
      console.log(`User ${normalizedEmail} already exists.`);
      return await prisma.profile.findUnique({ where: { userId: existingAuth.userId } });
    }

    const userId = randomUUID();
    console.log(`Creating user: ${fullName} (${role})`);
    
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

    return profile;
  };

  try {
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

    if (sd1) {
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

      if (md1) {
        const d1 = await findOrCreateUser(
          "d1.mock@abheepay.local",
          "Mock Distributor 1",
          "distributor",
          md1.id,
          80000
        );
        if (d1) {
           await findOrCreateUser("r1.mock@abheepay.local", "Mock Retailer 1", "retailer", d1.id, 18000, 1000);
           await findOrCreateUser("r2.mock@abheepay.local", "Mock Retailer 2", "retailer", d1.id, 17000, 900);
        }
      }
    }

    console.log("Mock hierarchy seeded successfully!");
  } catch (error) {
    console.error("Error seeding hierarchy:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
