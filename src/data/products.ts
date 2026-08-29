import { prisma } from "@/lib/prisma";

export async function getProducts(filters?: {
  category?: string;
  subCategory?: string;
  categoryId?: string;
}) {
  return prisma.product.findMany({
    where: {
      isPublished: true,
      ...(filters?.category
        ? { category: filters.category as "HANDMADE" | "CRAFT_SUPPLIES" }
        : {}),
      ...(filters?.subCategory ? { subCategory: filters.subCategory } : {}),
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      stock: { gt: 0 },
    },
    include: { maker: true, categoryRef: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id, isPublished: true },
    include: { maker: { include: { user: { select: { name: true } } } }, categoryRef: true },
  });
}

export async function getFeaturedProducts() {
  const featured = await prisma.product.findMany({
    where: { stock: { gt: 0 }, isPublished: true, isFeatured: true },
    include: { maker: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  if (featured.length > 0) return featured;

  return prisma.product.findMany({
    where: { stock: { gt: 0 }, isPublished: true },
    include: { maker: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

export async function getCraftSupplies() {
  return prisma.product.findMany({
    where: { category: "CRAFT_SUPPLIES", stock: { gt: 0 }, isPublished: true },
    include: { maker: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}
