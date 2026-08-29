export function normalizePhone(phone: string) {
  return phone.replace(/\s/g, "").replace(/^\+2/, "");
}

export function isValidEgyptianPhone(phone: string) {
  return /^01[0-9]{9}$/.test(normalizePhone(phone));
}

export function phoneToE164(phone: string) {
  const normalized = normalizePhone(phone);
  if (normalized.startsWith("+")) return normalized;
  if (normalized.startsWith("20")) return `+${normalized}`;
  if (normalized.startsWith("0")) return `+20${normalized.slice(1)}`;
  return `+20${normalized}`;
}

export function phoneToEmail(phone: string) {
  return `${normalizePhone(phone)}@phone.nasaq.local`;
}

export type SmsResult = { ok: boolean; error?: string };

export async function sendSms(phone: string, message: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_PHONE_NUMBER?.trim();

  if (!sid || !token || !from) {
    console.error("SMS not configured: missing Twilio env vars");
    return { ok: false, error: "خدمة الرسائل غير مفعّلة — تواصل مع الإدارة" };
  }

  const to = phoneToE164(phone);
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: message }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("SMS send failed:", to, err);
    return { ok: false, error: "فشل إرسال الرسالة — تأكد من رقم الهاتف" };
  }

  return { ok: true };
}

export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpSms(phone: string, code: string) {
  return sendSms(phone, `كود تأكيد نَسَق: ${code}\nصالح 10 دقائق`);
}
