const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const passwordAdmin = await bcrypt.hash("admin1234", 10);
  const passwordEmp = await bcrypt.hash("employee1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", name: "Admin", passwordHash: passwordAdmin, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { email: "tech@example.com" },
    update: {},
    create: { email: "tech@example.com", name: "Szerelő", passwordHash: passwordEmp, role: "EMPLOYEE" },
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});