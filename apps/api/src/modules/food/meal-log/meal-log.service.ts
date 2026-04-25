import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMealLogDto } from './dto/create-meal-log.dto';
import { UpdateMealLogDto } from './dto/update-meal-log.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MealLogService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMealLogDto: CreateMealLogDto) {
    const { items, date, ...rest } = createMealLogDto;
    
    return this.prisma.mealLog.create({
      data: {
        userId,
        ...rest,
        items: JSON.stringify(items),
        date: date ? new Date(date) : new Date(),
      },
    });
  }

  async findAll(userId: string, date?: string) {
    const where: any = { userId };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const mealLogs = await this.prisma.mealLog.findMany({
      where,
      orderBy: { time: 'asc' },
    });

    return mealLogs.map(log => ({
      ...log,
      items: JSON.parse(log.items),
    }));
  }

  async findOne(id: string, userId: string) {
    const mealLog = await this.prisma.mealLog.findFirst({
      where: { id, userId },
    });

    if (!mealLog) {
      throw new NotFoundException('Meal log not found');
    }

    return {
      ...mealLog,
      items: JSON.parse(mealLog.items),
    };
  }

  async update(id: string, userId: string, updateMealLogDto: UpdateMealLogDto) {
    await this.findOne(id, userId);

    const { items, date, ...rest } = updateMealLogDto;
    const updateData: any = { ...rest };
    
    if (items) {
      updateData.items = JSON.stringify(items);
    }
    
    if (date) {
      updateData.date = new Date(date);
    }

    const updated = await this.prisma.mealLog.update({
      where: { id },
      data: updateData,
    });

    return {
      ...updated,
      items: JSON.parse(updated.items),
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.mealLog.delete({
      where: { id },
    });
  }

  async getDailyStats(userId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const mealLogs = await this.prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totals = mealLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fats: acc.fats + log.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return totals;
  }

  async getWeeklyStats(userId: string) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const mealLogs = await this.prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: weekAgo,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Group by day
    const dailyStats: { [key: string]: number } = {};
    
    mealLogs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = 0;
      }
      dailyStats[dateKey] += log.calories;
    });

    return dailyStats;
  }
}
