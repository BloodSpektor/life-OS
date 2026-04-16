import { IsString, IsNumber, IsNotEmpty, Matches, Min } from 'class-validator';

export class CreateMealPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'scheduledTime must be in HH:MM format',
  })
  scheduledTime: string;

  @IsNumber()
  @Min(0)
  plannedCalories: number;
}
