import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const password = await hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@medicare.com" },
    update: {},
    create: {
      email: "admin@medicare.com",
      name: "Admin User",
      password,
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
