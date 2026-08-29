import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.product.deleteMany({});
  console.log(`Deleted ${deleted.count} demo products`);
  console.log("Done! Add your own products from /admin/products");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
