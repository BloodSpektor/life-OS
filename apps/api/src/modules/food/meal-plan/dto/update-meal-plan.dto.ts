import { IsString, IsNumber, IsOptional, Matches, Min } from 'class-validator';

export class UpdateMealPlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'scheduledTime must be in HH:MM format',
  })
  scheduledTime?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  plannedCalories?: number;
}
