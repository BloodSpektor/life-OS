import { IsString, IsNumber, IsNotEmpty, IsArray, IsOptional, Min, Matches } from 'class-validator';

export class CreateMealLogDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'time must be in HH:MM format',
  })
  time: string;

  @IsArray()
  @IsString({ each: true })
  items: string[];

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  protein: number;

  @IsNumber()
  @Min(0)
  carbs: number;

  @IsNumber()
  @Min(0)
  fats: number;

  @IsOptional()
  @IsString()
  date?: string; // ISO date string
}
