const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserIsolation() {
  try {
    console.log('=== Тест изоляции данных пользователей ===\n');

    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    });

    console.log('Пользователи в системе:');
    users.forEach(user => console.log(`- ${user.email} (${user.id})`));

    // Для каждого пользователя показываем его холодильники и продукты
    for (const user of users) {
      console.log(`\n--- Данные пользователя: ${user.email} ---`);
      
      const refrigerators = await prisma.refrigerator.findMany({
        where: { userId: user.id },
        include: { foodItems: true },
      });

      console.log(`Холодильников: ${refrigerators.length}`);
      refrigerators.forEach(ref => {
        console.log(`  - ${ref.name} (продуктов: ${ref.foodItems.length})`);
      });

      const foodItems = await prisma.foodItem.findMany({
        where: { userId: user.id },
      });

      console.log(`Всего продуктов: ${foodItems.length}`);
    }

    console.log('\n=== Тест завершен ===');
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserIsolation();
