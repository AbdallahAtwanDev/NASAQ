"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";
import { Role } from "@prisma/client";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.enum(["CUSTOMER", "MAKER"]).default("CUSTOMER"),
  brandName: z.string().optional(),
});

export async function registerAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    role: (formData.get("role") as string) || "CUSTOMER",
    brandName: (formData.get("brandName") as string) || undefined,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "بيانات غير صالحة" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) return { error: "البريد الإلكتروني مستخدم بالفعل" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const role = parsed.data.role as Role;

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role,
      ...(role === "MAKER" && parsed.data.brandName
        ? {
            makerProfile: {
              create: { brandName: parsed.data.brandName },
            },
          }
        : {}),
    },
  });

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return { success: true };
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "يرجى إدخال البريد وكلمة المرور" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "بيانات الدخول غير صحيحة" };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "بيانات الدخول غير صحيحة" };

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return { success: true, role: user.role };
}

export async function logoutAction() {
  await destroySession();
  return { success: true };
}
