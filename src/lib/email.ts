import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Email] To: ${to} | Subject: ${subject}`);
    return { ok: true, dev: true };
  }

  const from = process.env.EMAIL_FROM || "NASAQ <onboarding@resend.dev>";
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
    console.error("Email send failed:", err);
    return { ok: false };
  }
  return { ok: true };
}

export async function sendVerificationEmail(email: string, name: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const link = `${APP_URL}/verify-email?token=${token}`;
  const html = `
    <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#3A3F2E">مرحباً ${name} في نَسَق</h2>
      <p>اضغط على الزر لتأكيد بريدك الإلكتروني:</p>
      <a href="${link}" style="display:inline-block;background:#3A3F2E;color:#F2EDE2;padding:12px 24px;border-radius:4px;text-decoration:none;margin:16px 0">تأكيد البريد الإلكتروني</a>
      <p style="color:#888;font-size:12px">الرابط صالح لمدة 24 ساعة</p>
    </div>
  `;

  return sendEmail(email, "تأكيد بريدك الإلكتروني — نَسَق", html);
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
    <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#3A3F2E">تأكيد رقم الهاتف — نَسَق</h2>
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
