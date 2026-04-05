import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database cleanup...");

  try {
    // Delete in order to respect foreign key constraints
    console.log("Cleaning up dependent tables...");
    await prisma.walletTransaction.deleteMany({});
    await prisma.commissionLog.deleteMany({});
    await prisma.kycDocument.deleteMany({});
    await prisma.fundRequest.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.userServiceOverride.deleteMany({});
    await prisma.userCommissionOverride.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.staffPermission.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.eWalletCredit.deleteMany({});

    console.log("Cleaning up company bank accounts...");
    await prisma.companyBankAccount.deleteMany({});

    console.log("Cleaning up core user tables...");
    await prisma.wallet.deleteMany({});
    await prisma.userRole.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.authUser.deleteMany({});

    console.log("Cleanup completed successfully!");
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
