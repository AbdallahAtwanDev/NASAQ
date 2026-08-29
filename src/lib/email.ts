const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function notifyAdminNewCustomOrder(
  adminEmail: string,
  customerName: string,
  customerPhone: string | null,
  description: string
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false };

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const html = `
    <div dir="rtl" style="font-family:sans-serif">
      <h2 style="color:#3A3F2E">طلب مخصص جديد — نَسَق</h2>
      <p><strong>العميل:</strong> ${customerName}</p>
      <p><strong>الهاتف:</strong> ${customerPhone || "—"}</p>
      <p><strong>الوصف:</strong> ${description}</p>
      <a href="${APP_URL}/admin/orders">عرض في لوحة التحكم</a>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: adminEmail,
      subject: "طلب مخصص جديد — نَسَق",
      html,
    }),
  });

  return { ok: true };
}
