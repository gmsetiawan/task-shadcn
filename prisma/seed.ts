import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();

  await prisma.task.createMany({
    data: Array.from({ length: 100 }, () => ({
      description: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(["Todo", "Progress", "Done"]),
      priority: faker.helpers.arrayElement([
        "Minor",
        "Low",
        "Moderate",
        "Important",
        "Critical",
      ]),
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
