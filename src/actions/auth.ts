"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  sendVerificationEmail,
  sendPhoneVerificationEmail,
  generatePhoneCode,
} from "@/lib/email";

function isValidEgyptianPhone(phone: string) {
  return /^01[0-9]{9}$/.test(phone.replace(/\s/g, ""));
}

export async function registerAction(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const phone = (formData.get("phone") as string)?.replace(/\s/g, "") || "";
    const password = formData.get("password") as string;

    if (!name || !email || !password || !phone) {
      return { error: "يرجى ملء جميع الحقول المطلوبة" };
    }

    if (!isValidEgyptianPhone(phone)) {
      return { error: "رقم الهاتف غير صحيح (مثال: 01012345678)" };
    }

    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@nasaq.eg").toLowerCase();
    if (email === adminEmail) {
      return { error: "هذا البريد مخصص للإدارة فقط" };
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return { error: "البريد الإلكتروني مستخدم بالفعل" };

    const existingPhone = await prisma.user.findFirst({ where: { phone } });
    if (existingPhone) return { error: "رقم الهاتف مستخدم بالفعل" };

    const passwordHash = await bcrypt.hash(password, 12);
    const phoneCode = generatePhoneCode();

    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "CUSTOMER",
        phoneVerifyCode: phoneCode,
        phoneVerifyExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const emailResult = await sendVerificationEmail(email, name);
    await sendPhoneVerificationEmail(email, name, phone, phoneCode);

    const emailConfigured = Boolean(process.env.RESEND_API_KEY);

    return {
      success: true,
      needsVerification: true,
      devPhoneCode: !emailConfigured ? phoneCode : undefined,
      emailSent: emailResult.ok,
      emailConfigured,
    };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى." };
  }
}

export async function verifyEmailAction(token: string) {
  try {
    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || record.expires < new Date()) {
      return { error: "رابط التأكيد غير صالح أو منتهي الصلاحية" };
    }

    await prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    });
    await prisma.verificationToken.delete({ where: { token } });

    return { success: true };
  } catch (error) {
    console.error("Verify email error:", error);
    return { error: "حدث خطأ أثناء التأكيد. حاول مرة أخرى." };
  }
}

export async function verifyPhoneAction(email: string, code: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return { error: "المستخدم غير موجود" };
    if (user.phoneVerified) return { success: true, alreadyVerified: true };

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
    return { error: "حدث خطأ أثناء التأكيد. حاول مرة أخرى." };
  }
}

export async function resendVerificationAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return { error: "البريد غير موجود" };

    let devPhoneCode: string | undefined;
    const emailConfigured = Boolean(process.env.RESEND_API_KEY);

    if (!user.emailVerified) {
      await sendVerificationEmail(user.email, user.name);
    }

    if (!user.phoneVerified && user.phone) {
      const phoneCode = generatePhoneCode();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerifyCode: phoneCode,
          phoneVerifyExpires: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
      await sendPhoneVerificationEmail(user.email, user.name, user.phone, phoneCode);
      if (!emailConfigured) devPhoneCode = phoneCode;
    }

    return { success: true, devPhoneCode, emailConfigured };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { error: "حدث خطأ أثناء إعادة الإرسال. حاول مرة أخرى." };
  }
}
