import { prisma } from "@/lib/prisma";

export async function getActivePromotions() {
  try {
    const now = new Date();
    return await prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: null },
          { startsAt: null, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: { gte: now } },
        ],
      },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}
