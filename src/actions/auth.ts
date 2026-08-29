"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizePhone, isValidEgyptianPhone, phoneToEmail } from "@/lib/sms";

export async function registerAction(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const phone = normalizePhone((formData.get("phone") as string) || "");
    const password = formData.get("password") as string;

    if (!name || !phone || !password) {
      return { error: "يرجى ملء جميع الحقول" };
    }

    if (!isValidEgyptianPhone(phone)) {
      return { error: "رقم الهاتف غير صحيح (مثال: 01012345678)" };
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) return { error: "رقم الهاتف مسجّل بالفعل" };

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        phone,
        email: phoneToEmail(phone),
        passwordHash,
        role: "CUSTOMER",
        phoneVerified: new Date(),
      },
    });

    return { success: true, phone };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "حدث خطأ أثناء التسجيل" };
  }
}
