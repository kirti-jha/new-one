import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  console.log("--- TABLE COUNTS ---");
  const countTable = async (name: string, model: any) => {
    try {
      const c = await model.count();
      console.log(`${name}: ${c}`);
    } catch (e: any) {
      console.log(`${name}: ERROR (${e.message})`);
    }
  };

  await countTable("AuthUser", prisma.authUser);
  await countTable("Profile", prisma.profile);
  await countTable("Wallet", prisma.wallet);
  await countTable("Transaction", prisma.transaction);
  await countTable("WalletTransaction", prisma.walletTransaction);
  await countTable("CommissionLog", prisma.commissionLog);
  await countTable("CommissionSlab", prisma.commissionSlab);
  await countTable("UserCommissionOverride", prisma.userCommissionOverride);
  await countTable("FundRequest", prisma.fundRequest);
  await countTable("Notification", prisma.notification);

  console.log("\n--- LATEST 3 TRANSACTIONS ---");
  const txns = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
  console.log(JSON.stringify(txns, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
