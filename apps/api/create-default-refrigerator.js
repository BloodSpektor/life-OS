const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDefaultRefrigerator() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'default@user.com' },
    });

    if (!user) {
      console.log('Пользователь не найден');
      return;
    }

    const refrigerator = await prisma.refrigerator.create({
      data: {
        userId: user.id,
        name: 'Основной холодильник',
        location: 'Кухня',
        temperature: 4,
        isActive: true,
      },
    });

    console.log('Холодильник создан:');
    console.log(JSON.stringify(refrigerator, null, 2));
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultRefrigerator();
