import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ensurePrismaBinary } from './prisma/init';

// Ensure Prisma binary is available before Prisma client initialization
ensurePrismaBinary();

// Runtime error logging with timestamp
process.on('uncaughtException', (err) => {
  console.error(`[Runtime][${new Date().toISOString()}] UncaughtException:`, err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(
    `[Runtime][${new Date().toISOString()}] UnhandledRejection at:`,
    promise,
    'reason:',
    reason,
  );
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 API running on http://localhost:${port}/api`);
}

bootstrap();
