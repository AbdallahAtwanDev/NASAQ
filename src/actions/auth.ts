"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  normalizePhone,
  isValidEgyptianPhone,
  phoneToEmail,
  generateOtpCode,
  sendOtpSms,
} from "@/lib/sms";

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
    const code = generateOtpCode();

    await prisma.user.create({
      data: {
        name,
        phone,
        email: phoneToEmail(phone),
        passwordHash,
        role: "CUSTOMER",
        phoneVerifyCode: code,
        phoneVerifyExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const sms = await sendOtpSms(phone, code);
    if (!sms.ok) {
      await prisma.user.delete({ where: { phone } });
      return { error: sms.error || "فشل إرسال الرسالة" };
    }

    return { success: true, phone };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "حدث خطأ أثناء التسجيل" };
  }
}

export async function verifyPhoneAction(phone: string, code: string) {
  try {
    const normalized = normalizePhone(phone);
    const user = await prisma.user.findUnique({ where: { phone: normalized } });

    if (!user) return { error: "رقم الهاتف غير مسجّل" };
    if (user.phoneVerified) return { success: true };

    if (
      !user.phoneVerifyCode ||
      !user.phoneVerifyExpires ||
      user.phoneVerifyExpires < new Date()
    ) {
      return { error: "انتهت صلاحية الكود — اطلب كود جديد" };
    }

    if (user.phoneVerifyCode !== code.trim()) {
      return { error: "الكود غير صحيح" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: new Date(),
        phoneVerifyCode: null,
        phoneVerifyExpires: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Verify phone error:", error);
    return { error: "حدث خطأ أثناء التأكيد" };
  }
}

export async function resendOtpAction(phone: string) {
  try {
    const normalized = normalizePhone(phone);
    const user = await prisma.user.findUnique({ where: { phone: normalized } });
    if (!user) return { error: "رقم الهاتف غير مسجّل" };
    if (user.phoneVerified) return { error: "الحساب مفعّل بالفعل" };

    const code = generateOtpCode();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerifyCode: code,
        phoneVerifyExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const sms = await sendOtpSms(normalized, code);
    if (!sms.ok) return { error: sms.error || "فشل إرسال الرسالة" };

    return { success: true };
  } catch (error) {
    console.error("Resend OTP error:", error);
    return { error: "حدث خطأ أثناء إعادة الإرسال" };
  }
}
