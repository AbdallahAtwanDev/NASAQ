"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { uploadFile } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function submitCustomOrderAction(formData: FormData) {
  const session = await requireAuth();

  const description = formData.get("description") as string;
  const estimatedBudget = formData.get("estimatedBudget") as string;
  const targetDate = formData.get("targetDate") as string;

  if (!description) return { error: "يرجى وصف طلبك" };

  const referenceImages: string[] = [];
  for (let i = 0; i < 3; i++) {
    const file = formData.get(`image${i}`) as File | null;
    if (file && file.size > 0) {
      const path = `custom-orders/${session.id}/${Date.now()}-${i}-${file.name}`;
      const url = await uploadFile("nasaq-uploads", path, file);
      referenceImages.push(url);
    }
  }

  await prisma.customOrder.create({
    data: {
      customerId: session.id,
      description,
      referenceImages,
      estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}
