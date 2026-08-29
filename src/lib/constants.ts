export const BRAND = {
  ivory: "#F2EDE2",
  olive: "#3A3F2E",
  mustard: "#C69A2E",
  burgundy: "#5A1E2A",
  charcoal: "#1F1F1F",
  brown: "#3B2A22",
} as const;

export const CATEGORIES = [
  { slug: "Bags", labelAr: "حقائب", labelEn: "Bags" },
  { slug: "Home", labelAr: "ديكور منزلي", labelEn: "Home" },
  { slug: "Wearable", labelAr: "ملابس", labelEn: "Wearable" },
  { slug: "Accessories", labelAr: "إكسسوارات", labelEn: "Accessories" },
  { slug: "Jewelry", labelAr: "مجوهرات يدوية", labelEn: "Jewelry" },
  { slug: "Yarn", labelAr: "خيوط وأدوات", labelEn: "Craft Supplies" },
] as const;

export const EGYPTIAN_GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "البحيرة",
  "الدقهلية",
  "الشرقية",
  "الغربية",
  "المنوفية",
  "القليوبية",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "شمال سيناء",
  "جنوب سيناء",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "الوادي الجديد",
  "مطروح",
] as const;

export function formatEGP(amount: number) {
  return `${amount.toLocaleString("ar-EG")} ج.م`;
}

export function generateOrderNumber() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `NSQ-${num}`;
}
