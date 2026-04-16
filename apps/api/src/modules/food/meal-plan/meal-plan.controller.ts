import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';

@Controller('meal-plans')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Post()
  create(@Request() req, @Body() createMealPlanDto: CreateMealPlanDto) {
    const userId = req.user?.id || 'default-user'; // Temporary until auth is implemented
    return this.mealPlanService.create(userId, createMealPlanDto);
  }

  @Get()
  findAll(@Request() req) {
    const userId = req.user?.id || 'default-user';
    return this.mealPlanService.findAll(userId);
  }

  @Get('next')
  async getNextMeal(@Request() req) {
    const userId = req.user?.id || 'default-user';
    const nextMeal = await this.mealPlanService.getNextMeal(userId);
    // Возвращаем объект с полем data, чтобы явно показать null
    return { data: nextMeal };
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id || 'default-user';
    return this.mealPlanService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
  ) {
    const userId = req.user?.id || 'default-user';
    return this.mealPlanService.update(id, userId, updateMealPlanDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id || 'default-user';
    return this.mealPlanService.remove(id, userId);
  }
}
