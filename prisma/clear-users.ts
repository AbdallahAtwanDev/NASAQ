import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const nonAdminUsers = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    select: { id: true },
  });

  const ids = nonAdminUsers.map((u) => u.id);
  if (ids.length === 0) {
    console.log("No non-admin users to delete");
    return;
  }

  await prisma.customOrder.deleteMany({ where: { customerId: { in: ids } } });
  await prisma.order.deleteMany({ where: { customerId: { in: ids } } });
  await prisma.account.deleteMany({ where: { userId: { in: ids } } });
  await prisma.session.deleteMany({ where: { userId: { in: ids } } });
  await prisma.makerProfile.deleteMany({ where: { userId: { in: ids } } });

  const deleted = await prisma.user.deleteMany({
    where: { role: { not: "ADMIN" } },
  });

  console.log(`Deleted ${deleted.count} non-admin users`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
