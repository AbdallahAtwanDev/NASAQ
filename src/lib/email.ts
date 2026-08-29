import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export type EmailResult = {
  ok: boolean;
  dev?: boolean;
  error?: string;
};

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.log(`[Email] To: ${to} | Subject: ${subject}`);
    return { ok: false, dev: true, error: "RESEND_API_KEY غير مضاف" };
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Email send failed:", to, err);
    let message = "فشل إرسال الإيميل";
    try {
      const parsed = JSON.parse(err) as { message?: string };
      if (parsed.message?.includes("own email address")) {
        message =
          "حساب Resend يسمح حالياً بإرسال الإيميل لبريد المسجّل فقط. استخدم الكود الظاهر على الشاشة.";
      } else if (parsed.message) {
        message = parsed.message;
      }
    } catch {
      /* ignore */
    }
    return { ok: false, error: message };
  }

  return { ok: true };
}

export async function sendRegistrationEmail(
  email: string,
  name: string,
  phone: string,
  phoneCode: string
) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const link = `${APP_URL}/verify-email?token=${token}`;
  const html = `
    <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#3A3F2E">مرحباً ${name} في نَسَق</h2>
      <p>لإكمال التسجيل:</p>
      <p><strong>1.</strong> اضغط لتأكيد بريدك الإلكتروني:</p>
      <a href="${link}" style="display:inline-block;background:#3A3F2E;color:#F2EDE2;padding:12px 24px;border-radius:4px;text-decoration:none;margin:12px 0">تأكيد البريد الإلكتروني</a>
      <p><strong>2.</strong> كود تأكيد رقم الهاتف <strong>${phone}</strong>:</p>
      <p style="font-size:32px;font-weight:bold;color:#C69A2E;letter-spacing:8px;margin:16px 0">${phoneCode}</p>
      <p style="color:#888;font-size:12px">الكود صالح 10 دقائق — رابط البريد صالح 24 ساعة</p>
    </div>
  `;

  return sendEmail(email, "تأكيد حسابك — نَسَق", html);
}

export function generatePhoneCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendPhoneVerificationEmail(
  email: string,
  name: string,
  phone: string,
  code: string
) {
  const html = `
    <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#3A3F2E">كود تأكيد الهاتف — نَسَق</h2>
      <p>مرحباً ${name}،</p>
      <p>كود تأكيد رقم <strong>${phone}</strong>:</p>
      <p style="font-size:32px;font-weight:bold;color:#C69A2E;letter-spacing:8px">${code}</p>
      <p style="color:#888;font-size:12px">الكود صالح لمدة 10 دقائق</p>
    </div>
  `;
  return sendEmail(email, "كود تأكيد الهاتف — نَسَق", html);
}

export async function notifyAdminNewCustomOrder(
  adminEmail: string,
  customerName: string,
  description: string
) {
  const html = `
    <div dir="rtl" style="font-family:sans-serif">
      <h2 style="color:#3A3F2E">طلب مخصص جديد — نَسَق</h2>
      <p><strong>العميل:</strong> ${customerName}</p>
      <p><strong>الوصف:</strong> ${description}</p>
      <a href="${APP_URL}/admin/orders">عرض في لوحة التحكم</a>
    </div>
  `;
  return sendEmail(adminEmail, "طلب مخصص جديد — نَسَق", html);
}
