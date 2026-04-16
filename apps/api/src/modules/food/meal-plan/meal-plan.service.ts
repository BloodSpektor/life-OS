import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MealPlanService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMealPlanDto: CreateMealPlanDto) {
    return this.prisma.mealPlan.create({
      data: {
        userId,
        ...createMealPlanDto,
      },
    });
  }

  async findAll(userId: string) {
    const mealPlans = await this.prisma.mealPlan.findMany({
      where: { userId },
      orderBy: { scheduledTime: 'asc' },
    });
    return mealPlans;
  }

  async findOne(id: string, userId: string) {
    const mealPlan = await this.prisma.mealPlan.findFirst({
      where: { id, userId },
    });

    if (!mealPlan) {
      throw new NotFoundException('Meal plan not found');
    }

    return mealPlan;
  }

  async update(id: string, userId: string, updateMealPlanDto: UpdateMealPlanDto) {
    await this.findOne(id, userId);

    return this.prisma.mealPlan.update({
      where: { id },
      data: updateMealPlanDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.mealPlan.delete({
      where: { id },
    });
  }

  async getNextMeal(userId: string) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const mealPlans = await this.prisma.mealPlan.findMany({
      where: { userId },
      orderBy: { scheduledTime: 'asc' },
    });

    if (mealPlans.length === 0) {
      return null;
    }

    // Find next meal after current time
    const nextMeal = mealPlans.find(meal => meal.scheduledTime > currentTime);
    
    // If no meal found after current time, return first meal of the day (next day)
    return nextMeal || mealPlans[0];
  }
}
