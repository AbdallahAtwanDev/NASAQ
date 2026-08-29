"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { uploadFile } from "@/lib/supabase";
import { generateOrderNumber } from "@/lib/constants";

interface CheckoutItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CheckoutData {
  governorate: string;
  shippingAddress: string;
  phone: string;
  paymentMethod: string;
  giftMessage?: string;
  items: CheckoutItem[];
}

export async function getShippingRate(governorate: string) {
  const rate = await prisma.shippingRate.findUnique({ where: { governorate } });
  return rate?.cost ?? 50;
}

export async function getShippingRates() {
  return prisma.shippingRate.findMany({ orderBy: { governorate: "asc" } });
}

export async function createOrderAction(
  data: CheckoutData,
  receiptFile: File
) {
  const session = await requireAuth();

  if (!data.items.length) return { error: "السلة فارغة" };

  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((i) => i.productId) } },
  });

  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { error: "منتج غير موجود" };
    if (product.stock < item.quantity) {
      return { error: `الكمية غير متوفرة لـ ${product.title}` };
    }
  }

  const shippingCost = await getShippingRate(data.governorate);
  const itemsTotal = data.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const totalAmount = itemsTotal + shippingCost;

  const receiptPath = `receipts/${session.id}/${Date.now()}-${receiptFile.name}`;
  const receiptImageUrl = await uploadFile("nasaq-uploads", receiptPath, receiptFile);

  const paymentDeadline = new Date(Date.now() + 30 * 60 * 1000);

  let orderNumber = generateOrderNumber();
  let exists = await prisma.order.findUnique({ where: { orderNumber } });
  while (exists) {
    orderNumber = generateOrderNumber();
    exists = await prisma.order.findUnique({ where: { orderNumber } });
  }

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        customerId: session.id,
        totalAmount,
        shippingCost,
        governorate: data.governorate,
        shippingAddress: data.shippingAddress,
        phone: data.phone,
        paymentMethod: data.paymentMethod,
        receiptImageUrl,
        giftMessage: data.giftMessage || null,
        paymentDeadline,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  return { success: true, orderId: order.id, orderNumber: order.orderNumber };
}

export async function getOrderById(orderId: string) {
  const session = await requireAuth();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      customer: { select: { name: true, email: true } },
    },
  });

  if (!order) return null;
  if (order.customerId !== session.id && session.role !== "ADMIN") return null;
  return order;
}
