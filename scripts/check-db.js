const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.count();
    const products = await prisma.product.count();
    const shipping = await prisma.shippingRate.count();
    console.log(JSON.stringify({ users, products, shipping, ok: true }));
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: e.message }));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
