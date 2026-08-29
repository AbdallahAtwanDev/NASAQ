"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { ProductCategory } from "@prisma/client";

export async function getAdminProducts() {
  await requireAdmin();
  return prisma.product.findMany({
    include: { maker: true, categoryRef: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const salePrice = formData.get("salePrice") as string;
  const category = (formData.get("category") as ProductCategory) || "HANDMADE";
  const categoryId = (formData.get("categoryId") as string) || null;
  const stock = parseInt(formData.get("stock") as string) || 1;
  const isUniquePiece = formData.get("isUniquePiece") === "on";
  const isPublished = formData.get("isPublished") !== "off";
  const isFeatured = formData.get("isFeatured") === "on";

  const images: string[] = [];
  for (let i = 0; i < 5; i++) {
    const file = formData.get(`image${i}`) as File | null;
    if (file && file.size > 0) {
      const path = `products/${Date.now()}-${i}-${file.name}`;
      const url = await uploadFile("nasaq-uploads", path, file);
      images.push(url);
    }
  }

  if (!title || !description || !price) {
    return { error: "يرجى ملء الحقول المطلوبة" };
  }

  await prisma.product.create({
    data: {
      title,
      description,
      price,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      category,
      categoryId: categoryId || null,
      images,
      stock,
      isUniquePiece,
      isPublished,
      isFeatured,
    },
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAdmin();

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { error: "المنتج غير موجود" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const salePrice = formData.get("salePrice") as string;
  const category = (formData.get("category") as ProductCategory) || "HANDMADE";
  const categoryId = (formData.get("categoryId") as string) || null;
  const stock = parseInt(formData.get("stock") as string) || 1;
  const isUniquePiece = formData.get("isUniquePiece") === "on";
  const isPublished = formData.get("isPublished") !== "off";
  const isFeatured = formData.get("isFeatured") === "on";
  const keepImages = (formData.get("keepImages") as string)?.split(",").filter(Boolean) ?? [];

  const newImages: string[] = [...keepImages];
  for (let i = 0; i < 5; i++) {
    const file = formData.get(`image${i}`) as File | null;
    if (file && file.size > 0) {
      const path = `products/${Date.now()}-${i}-${file.name}`;
      const url = await uploadFile("nasaq-uploads", path, file);
      newImages.push(url);
    }
  }

  await prisma.product.update({
    where: { id },
    data: {
      title,
      description,
      price,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      category,
      categoryId: categoryId || null,
      images: newImages,
      stock,
      isUniquePiece,
      isPublished,
      isFeatured,
    },
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true };
}
