import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: "Admin", email: "admin@demo.com", password: "admin123", role: "ADMIN" },
    { name: "User 1", email: "user1@demo.com", password: "user123", role: "NORMAL" },
    { name: "User 2", email: "user2@demo.com", password: "user123", role: "NORMAL" },
    { name: "User 3", email: "user3@demo.com", password: "user123", role: "NORMAL" },
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword, role: u.role },
      create: { name: u.name, email: u.email, password: hashedPassword, role: u.role },
    });
  }

  // Demo tracking codes
  await prisma.trackingCode.upsert({
    where: { code: "9876543210987654" },
    update: {},
    create: { code: "9876543210987654", overrideStatus: "SUCCESS" },
  });
  await prisma.trackingCode.upsert({
    where: { code: "1111222233334444" },
    update: {},
    create: { code: "1111222233334444", overrideStatus: "FAILED" },
  });

  console.log(`Seeded ${users.length} users and 2 demo tracking codes.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
