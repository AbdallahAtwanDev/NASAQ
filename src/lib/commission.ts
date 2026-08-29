import { prisma } from "@/lib/prisma";

export async function calculateMakerCommissions() {
  const now = new Date();
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const makers = await prisma.makerProfile.findMany({
    include: {
      products: {
        include: {
          orderItems: {
            include: {
              order: true,
            },
          },
        },
      },
    },
  });

  const updates = [];

  for (const maker of makers) {
    let salesCount = 0;

    for (const product of maker.products) {
      for (const item of product.orderItems) {
        const order = item.order;
        if (
          order.paymentStatus === "APPROVED" &&
          order.orderStatus === "DELIVERED" &&
          order.createdAt >= startOfPrevMonth &&
          order.createdAt <= endOfPrevMonth
        ) {
          salesCount += item.quantity;
        }
      }
    }

    const newRate = salesCount >= 10 ? 5.0 : 15.0;

    updates.push(
      prisma.makerProfile.update({
        where: { id: maker.id },
        data: {
          salesPreviousMonth: salesCount,
          commissionRate: newRate,
        },
      })
    );
  }

  await prisma.$transaction(updates);

  return {
    success: true,
    makersUpdated: updates.length,
    timestamp: now.toISOString(),
  };
}
