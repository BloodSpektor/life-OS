import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createFoodItemDto: CreateFoodItemDto) {
    // Получаем или создаем холодильник по умолчанию для пользователя
    let refrigerator = await this.prisma.refrigerator.findFirst({
      where: { userId, isActive: true },
    });

    if (!refrigerator) {
      refrigerator = await this.prisma.refrigerator.create({
        data: {
          userId,
          name: 'Мой холодильник',
          isActive: true,
        },
      });
    }

    return this.prisma.foodItem.create({
      data: {
        userId,
        refrigeratorId: refrigerator.id,
        name: createFoodItemDto.name,
        category: createFoodItemDto.category,
        quantity: createFoodItemDto.quantity,
        unit: createFoodItemDto.unit,
        expiryDate: createFoodItemDto.expiryDate ? new Date(createFoodItemDto.expiryDate) : null,
        calories: createFoodItemDto.calories,
        protein: createFoodItemDto.protein,
        carbs: createFoodItemDto.carbs,
        fats: createFoodItemDto.fats,
      },
      include: {
        refrigerator: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.foodItem.findMany({
      where: { userId },
      include: {
        refrigerator: true,
      },
      orderBy: [
        { category: 'asc' },
        { expiryDate: 'asc' },
      ],
    });
  }

  async findOne(id: string, userId: string) {
    const foodItem = await this.prisma.foodItem.findFirst({
      where: { id, userId },
      include: {
        refrigerator: true,
      },
    });

    if (!foodItem) {
      throw new NotFoundException('Продукт не найден');
    }

    return foodItem;
  }

  async update(id: string, userId: string, updateFoodItemDto: UpdateFoodItemDto) {
    await this.findOne(id, userId);

    const updateData: any = { ...updateFoodItemDto };
    
    if (updateFoodItemDto.expiryDate) {
      updateData.expiryDate = new Date(updateFoodItemDto.expiryDate);
    }

    return this.prisma.foodItem.update({
      where: { id },
      data: updateData,
      include: {
        refrigerator: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.foodItem.delete({
      where: { id },
    });
  }

  async getCategories(userId: string) {
    const items = await this.prisma.foodItem.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category'],
    });

    return items.map(item => item.category).filter(Boolean);
  }

  async getStats(userId: string) {
    const items = await this.prisma.foodItem.findMany({
      where: { userId },
    });

    const now = new Date();
    const expiringItems = items.filter(item => {
      if (!item.expiryDate) return false;
      const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 5 && daysUntilExpiry >= 0;
    });

    const totalCalories = items.reduce((sum, item) => sum + (item.calories || 0), 0);

    return {
      totalItems: items.length,
      expiringItems: expiringItems.length,
      totalCalories,
    };
  }
}
