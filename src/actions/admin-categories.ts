"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getAdminCategories() {
  await requireAdmin();
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const slug = formData.get("slug") as string;
  const labelAr = formData.get("labelAr") as string;
  const labelEn = formData.get("labelEn") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const isActive = formData.get("isActive") !== "off";

  let imageUrl: string | null = null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    imageUrl = await uploadFile("nasaq-uploads", `categories/${Date.now()}-${file.name}`, file);
  }

  await prisma.category.create({
    data: { slug, labelAr, labelEn, sortOrder, isActive, imageUrl },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireAdmin();

  const labelAr = formData.get("labelAr") as string;
  const labelEn = formData.get("labelEn") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const isActive = formData.get("isActive") !== "off";

  let imageUrl = (formData.get("currentImage") as string) || null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    imageUrl = await uploadFile("nasaq-uploads", `categories/${Date.now()}-${file.name}`, file);
  }

  await prisma.category.update({
    where: { id },
    data: { labelAr, labelEn, sortOrder, isActive, imageUrl },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}
