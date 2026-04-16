import { Module } from '@nestjs/common';
import { InventoryModule } from './inventory/inventory.module';
import { NutritionModule } from './nutrition-engine/nutrition.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';

@Module({
  imports: [InventoryModule, NutritionModule, MealPlanModule],
})
export class FoodModule {}
