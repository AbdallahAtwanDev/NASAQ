"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  sendRegistrationEmail,
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

    const emailResult = await sendRegistrationEmail(email, name, phone, phoneCode);

    return {
      success: true,
      needsVerification: true,
      phoneCode: emailResult.ok ? undefined : phoneCode,
      emailSent: emailResult.ok,
      emailNotice: emailResult.ok
        ? undefined
        : emailResult.error ||
          "لم يُرسل الإيميل — استخدم الكود الظاهر أدناه لإكمال التسجيل",
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

    return { success: true, email: record.identifier };
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

    let phoneCode: string | undefined;
    let emailSent = true;
    let emailNotice: string | undefined;

    if (!user.emailVerified) {
      const code = generatePhoneCode();
      const result = await sendRegistrationEmail(
        user.email,
        user.name,
        user.phone || "",
        code
      );
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerifyCode: code,
          phoneVerifyExpires: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
      emailSent = result.ok;
      if (!result.ok) {
        phoneCode = code;
        emailNotice = result.error || "لم يُرسل الإيميل — استخدم الكود أدناه";
      }
    } else if (!user.phoneVerified && user.phone) {
      const code = generatePhoneCode();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerifyCode: code,
          phoneVerifyExpires: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
      const result = await sendPhoneVerificationEmail(
        user.email,
        user.name,
        user.phone,
        code
      );
      emailSent = result.ok;
      if (!result.ok) {
        phoneCode = code;
        emailNotice = result.error || "لم يُرسل الإيميل — استخدم الكود أدناه";
      }
    }

    return { success: true, phoneCode, emailSent, emailNotice };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { error: "حدث خطأ أثناء إعادة الإرسال. حاول مرة أخرى." };
  }
}
