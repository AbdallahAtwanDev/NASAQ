const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
  const admin = await prisma.user.findUnique({ where: { email: "admin@nasaq.eg" } });
  console.log("Admin exists:", !!admin);
  console.log("Role:", admin?.role);
  if (admin?.passwordHash) {
    const valid = await bcrypt.compare("admin123", admin.passwordHash);
    console.log("admin123 matches hash:", valid);
  }
  await prisma.$disconnect();
}

main();
