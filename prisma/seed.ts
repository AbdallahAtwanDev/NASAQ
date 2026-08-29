import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nasaq.eg" },
    update: {},
    create: {
      name: "مدير نسق",
      email: "admin@nasaq.eg",
      phone: "01000000001",
      passwordHash,
      role: "ADMIN",
    },
  });

  const makerUser = await prisma.user.upsert({
    where: { email: "maker@nasaq.eg" },
    update: {},
    create: {
      name: "سارة الحرفية",
      email: "maker@nasaq.eg",
      phone: "01000000002",
      passwordHash: await bcrypt.hash("maker123", 12),
      role: "MAKER",
      makerProfile: {
        create: {
          brandName: "إبداع سارة",
          bio: "حرفية متخصصة في الحقائب اليدوية والإكسسوارات",
        },
      },
    },
  });

  const maker = await prisma.makerProfile.findUnique({
    where: { userId: makerUser.id },
  });

  const placeholderImg =
    "https://images.unsplash.com/photo-1452860606245-08befbf0b149?w=600&h=600&fit=crop";

  const products = [
    {
      title: "حقيبة يدوية من الجلد الطبيعي",
      description:
        "حقيبة يدوية مصنوعة بعناية من الجلد الطبيعي المصري، بتصميم عصري يجمع بين الأصالة والحداثة. كل قطعة فريدة بخياطتها اليدوية الدقيقة.",
      price: 850,
      subCategory: "Bags",
      images: [placeholderImg, "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"],
      stock: 1,
      isUniquePiece: true,
      makerId: maker?.id,
    },
    {
      title: "وسادة ديكور مطرزة",
      description: "وسادة ديكور منزلية مطرزة يدوياً بخيوط قطنية ملونة، مثالية لإضافة لمسة دافئة لغرفة المعيشة.",
      price: 320,
      subCategory: "Home",
      images: ["https://images.unsplash.com/photo-1584100936595-c0654b4a2cf7?w=600&h=600&fit=crop"],
      stock: 3,
      isUniquePiece: false,
      makerId: maker?.id,
    },
    {
      title: "قلادة يدوية من الخرز",
      description: "قلادة فريدة مصنوعة من خرز طبيعي ملون، بتصميم مستوحى من الفن المصري القديم.",
      price: 180,
      subCategory: "Jewelry",
      images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop"],
      stock: 1,
      isUniquePiece: true,
      makerId: maker?.id,
    },
    {
      title: "خيوط قطنية ملونة - مجموعة",
      description: "مجموعة من 12 لفة خيوط قطنية عالية الجودة بألوان متنوعة، مثالية لمشاريع الكروشيه والتطريز.",
      price: 120,
      category: "CRAFT_SUPPLIES" as const,
      subCategory: "Yarn",
      images: ["https://images.unsplash.com/photo-1609357600804-e9995ac638ee?w=600&h=600&fit=crop"],
      stock: 50,
      isUniquePiece: false,
      makerId: maker?.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  const shippingRates = [
    { governorate: "القاهرة", cost: 40 },
    { governorate: "الجيزة", cost: 40 },
    { governorate: "الإسكندرية", cost: 50 },
    { governorate: "البحيرة", cost: 55 },
    { governorate: "الدقهلية", cost: 55 },
    { governorate: "الشرقية", cost: 55 },
    { governorate: "الغربية", cost: 55 },
    { governorate: "المنوفية", cost: 55 },
    { governorate: "القليوبية", cost: 50 },
    { governorate: "كفر الشيخ", cost: 60 },
    { governorate: "دمياط", cost: 60 },
    { governorate: "بورسعيد", cost: 55 },
    { governorate: "الإسماعيلية", cost: 55 },
    { governorate: "السويس", cost: 55 },
    { governorate: "الفيوم", cost: 60 },
    { governorate: "بني سويف", cost: 65 },
    { governorate: "المنيا", cost: 70 },
    { governorate: "أسيوط", cost: 75 },
    { governorate: "سوهاج", cost: 80 },
    { governorate: "قنا", cost: 85 },
    { governorate: "الأقصر", cost: 85 },
    { governorate: "أسوان", cost: 90 },
    { governorate: "البحر الأحمر", cost: 95 },
    { governorate: "مطروح", cost: 80 },
    { governorate: "شمال سيناء", cost: 90 },
    { governorate: "جنوب سيناء", cost: 95 },
    { governorate: "الوادي الجديد", cost: 100 },
  ];

  for (const rate of shippingRates) {
    await prisma.shippingRate.upsert({
      where: { governorate: rate.governorate },
      update: { cost: rate.cost },
      create: rate,
    });
  }

  console.log("Seed completed!");
  console.log("Admin:", admin.email, "/ admin123");
  console.log("Maker:", makerUser.email, "/ maker123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
