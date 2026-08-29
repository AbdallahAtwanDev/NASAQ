"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getAdminPromotions() {
  await requireAdmin();
  return prisma.promotion.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getActivePromotions() {
  const now = new Date();
  return prisma.promotion.findMany({
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
}

export async function createPromotionAction(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const linkUrl = (formData.get("linkUrl") as string) || null;
  const discountPercent = formData.get("discountPercent") as string;
  const isActive = formData.get("isActive") !== "off";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const startsAt = formData.get("startsAt") as string;
  const endsAt = formData.get("endsAt") as string;

  let imageUrl: string | null = null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    imageUrl = await uploadFile("nasaq-uploads", `promotions/${Date.now()}-${file.name}`, file);
  }

  await prisma.promotion.create({
    data: {
      title,
      description,
      linkUrl,
      imageUrl,
      discountPercent: discountPercent ? parseFloat(discountPercent) : null,
      isActive,
      sortOrder,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/promotions");
  return { success: true };
}

export async function updatePromotionAction(id: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const linkUrl = (formData.get("linkUrl") as string) || null;
  const discountPercent = formData.get("discountPercent") as string;
  const isActive = formData.get("isActive") !== "off";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const startsAt = formData.get("startsAt") as string;
  const endsAt = formData.get("endsAt") as string;

  let imageUrl = (formData.get("currentImage") as string) || null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    imageUrl = await uploadFile("nasaq-uploads", `promotions/${Date.now()}-${file.name}`, file);
  }

  await prisma.promotion.update({
    where: { id },
    data: {
      title,
      description,
      linkUrl,
      imageUrl,
      discountPercent: discountPercent ? parseFloat(discountPercent) : null,
      isActive,
      sortOrder,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/promotions");
  return { success: true };
}

export async function deletePromotionAction(id: string) {
  await requireAdmin();
  await prisma.promotion.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/promotions");
  return { success: true };
}
