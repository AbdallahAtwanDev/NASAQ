import { prisma } from "@/lib/prisma";

export async function getProducts(filters?: {
  category?: string;
  subCategory?: string;
}) {
  return prisma.product.findMany({
    where: {
      ...(filters?.category
        ? { category: filters.category as "HANDMADE" | "CRAFT_SUPPLIES" }
        : {}),
      ...(filters?.subCategory ? { subCategory: filters.subCategory } : {}),
      stock: { gt: 0 },
    },
    include: { maker: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { maker: { include: { user: { select: { name: true } } } } },
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { stock: { gt: 0 } },
    include: { maker: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

export async function getCraftSupplies() {
  return prisma.product.findMany({
    where: { category: "CRAFT_SUPPLIES", stock: { gt: 0 } },
    include: { maker: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}
