import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateFoodItemDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  calories?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  protein?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  carbs?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fats?: number;
}
