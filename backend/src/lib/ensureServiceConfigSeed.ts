import type { PrismaClient } from "@prisma/client";
import { DEFAULT_SERVICES } from "./defaultServices";

export async function ensureServiceConfigSeed(prisma: PrismaClient) {
  const existingCount = await prisma.serviceConfig.count();
  if (existingCount >= DEFAULT_SERVICES.length) return;

  for (const service of DEFAULT_SERVICES) {
    await prisma.serviceConfig.upsert({
      where: { serviceKey: service.serviceKey },
      update: {
        serviceLabel: service.serviceLabel,
        routePath: service.routePath,
        icon: service.icon,
      },
      create: {
        serviceKey: service.serviceKey,
        serviceLabel: service.serviceLabel,
        routePath: service.routePath,
        icon: service.icon,
        isEnabled: true,
      },
    });
  }
}
