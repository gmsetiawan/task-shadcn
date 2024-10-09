import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  function getRandomDueDate(): Date {
    const daysToAdd = faker.number.int({ min: 7, max: 30 }); // Menghasilkan jumlah hari acak antara 7 dan 30
    const dueDate = new Date(); // Tanggal sekarang
    dueDate.setDate(dueDate.getDate() + daysToAdd); // Menambahkan jumlah hari ke tanggal sekarang
    return dueDate;
  }

  await prisma.task.deleteMany();

  await prisma.task.create({
    data: {
      description: "Available for you. Don't forget to like",
      status: "Todo",
      priority: "Moderate",
      dueDate: new Date(),
    },
  });

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
      dueDate: getRandomDueDate(),
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
