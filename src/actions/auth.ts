"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "يرجى ملء جميع الحقول المطلوبة" };
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@nasaq.eg";
  if (email === adminEmail) {
    return { error: "هذا البريد مخصص للإدارة فقط" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "البريد الإلكتروني مستخدم بالفعل" };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  return { success: true };
}
