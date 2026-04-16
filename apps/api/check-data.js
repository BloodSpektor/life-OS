const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    console.log('=== Пользователи ===');
    console.log(JSON.stringify(users, null, 2));

    const refrigerators = await prisma.refrigerator.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
      },
    });

    console.log('\n=== Холодильники ===');
    console.log(JSON.stringify(refrigerators, null, 2));

    const foodItems = await prisma.foodItem.findMany({
      select: {
        id: true,
        userId: true,
        refrigeratorId: true,
        name: true,
      },
    });

    console.log('\n=== Продукты ===');
    console.log(JSON.stringify(foodItems, null, 2));
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
