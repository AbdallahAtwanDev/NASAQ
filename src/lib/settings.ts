import { prisma } from "@/lib/prisma";

export const SETTING_KEYS = {
  VODAFONE_CASH: "vodafone_cash",
  INSTAPAY_HANDLE: "instapay_handle",
  INSTAPAY_QR: "instapay_qr_url",
  CONTACT_PHONE: "contact_phone",
  CONTACT_EMAIL: "contact_email",
  CONTACT_WHATSAPP: "contact_whatsapp",
  FACEBOOK_URL: "facebook_url",
  INSTAGRAM_URL: "instagram_url",
  HERO_TITLE: "hero_title",
  HERO_SUBTITLE: "hero_subtitle",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

const DEFAULTS: Record<string, string> = {
  [SETTING_KEYS.VODAFONE_CASH]: "01033706441",
  [SETTING_KEYS.INSTAPAY_HANDLE]: "atwan@instaPay",
  [SETTING_KEYS.INSTAPAY_QR]: "",
  [SETTING_KEYS.CONTACT_PHONE]: "01033706441",
  [SETTING_KEYS.CONTACT_EMAIL]: "info@nasaq.eg",
  [SETTING_KEYS.CONTACT_WHATSAPP]: "01033706441",
  [SETTING_KEYS.FACEBOOK_URL]: "",
  [SETTING_KEYS.INSTAGRAM_URL]: "",
  [SETTING_KEYS.HERO_TITLE]: "إبداعات يدوية بنَسَق فريد",
  [SETTING_KEYS.HERO_SUBTITLE]:
    "اكتشف قطعاً فريدة صنعها حرفيون مصريون، أو اطلب قطعة مخصصة",
};

export async function getSetting(key: string): Promise<string> {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value ?? DEFAULTS[key] ?? "";
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.siteSetting.findMany();
  const map: Record<string, string> = { ...DEFAULTS };
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function upsertSetting(key: string, value: string, labelAr?: string) {
  return prisma.siteSetting.upsert({
    where: { key },
    update: { value, labelAr },
    create: { key, value, labelAr },
  });
}

export async function upsertSettings(data: Record<string, string>) {
  const ops = Object.entries(data).map(([key, value]) =>
    prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );
  await prisma.$transaction(ops);
}
