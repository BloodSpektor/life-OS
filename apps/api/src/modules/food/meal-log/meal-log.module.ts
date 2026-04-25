import { Module } from '@nestjs/common';
import { MealLogService } from './meal-log.service';
import { MealLogController } from './meal-log.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MealLogController],
  providers: [MealLogService],
  exports: [MealLogService],
})
export class MealLogModule {}
