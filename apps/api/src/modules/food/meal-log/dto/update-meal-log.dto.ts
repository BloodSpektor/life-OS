import { PartialType } from '@nestjs/mapped-types';
import { CreateMealLogDto } from './create-meal-log.dto';

export class UpdateMealLogDto extends PartialType(CreateMealLogDto) {}
