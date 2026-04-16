import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default user
  const user = await prisma.user.upsert({
    where: { email: 'default@user.com' },
    update: {},
    create: {
      id: 'default-user',
      email: 'default@user.com',
      password: 'password',
      name: 'Default User',
    },
  });

  console.log('Default user created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
