import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Проверяем, существует ли пользователь default-user
  const existingUser = await prisma.user.findUnique({
    where: { id: 'default-user' },
  });

  if (!existingUser) {
    // Создаем пользователя default-user
    await prisma.user.create({
      data: {
        id: 'default-user',
        email: 'default@example.com',
        password: 'hashed-password', // В реальном приложении используйте хеш
        name: 'Default User',
      },
    });
    console.log('✅ Default user created');
  } else {
    console.log('✅ Default user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
