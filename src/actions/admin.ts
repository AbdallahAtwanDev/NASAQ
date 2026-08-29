"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getPendingOrders() {
  await requireAuth(["ADMIN"]);
  return prisma.order.findMany({
    where: { paymentStatus: "PENDING" },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllOrders() {
  await requireAuth(["ADMIN"]);
  return prisma.order.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      items: { include: { product: { include: { maker: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function verifyPaymentAction(
  orderId: string,
  action: "approve" | "reject",
  rejectionReason?: string
) {
  await requireAuth(["ADMIN"]);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { include: { maker: true } } } } },
  });
  if (!order) return { error: "الطلب غير موجود" };

  if (action === "approve") {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.APPROVED },
    });
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.REJECTED,
          rejectionReason: rejectionReason || "تم رفض الإيصال",
          orderStatus: OrderStatus.CANCELLED,
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
) {
  await requireAuth(["ADMIN"]);

  await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: status },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function getShippingRatesAdmin() {
  await requireAuth(["ADMIN"]);
  return prisma.shippingRate.findMany({ orderBy: { governorate: "asc" } });
}

export async function upsertShippingRate(governorate: string, cost: number) {
  await requireAuth(["ADMIN"]);

  await prisma.shippingRate.upsert({
    where: { governorate },
    update: { cost },
    create: { governorate, cost },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteShippingRate(id: string) {
  await requireAuth(["ADMIN"]);
  await prisma.shippingRate.delete({ where: { id } });
  revalidatePath("/admin");
  return { success: true };
}

export async function getCustomOrders() {
  await requireAuth(["ADMIN"]);
  return prisma.customOrder.findMany({
    include: { customer: { select: { name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateCustomOrderAction(
  id: string,
  data: { status?: string; quotedPrice?: number; adminNotes?: string }
) {
  await requireAuth(["ADMIN"]);

  await prisma.customOrder.update({
    where: { id },
    data,
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function getAdminStats() {
  await requireAuth(["ADMIN"]);

  const [pendingPayments, totalOrders, totalProducts, customOrders] =
    await Promise.all([
      prisma.order.count({ where: { paymentStatus: "PENDING" } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.customOrder.count({ where: { status: "UNDER_REVIEW" } }),
    ]);

  return { pendingPayments, totalOrders, totalProducts, customOrders };
}
