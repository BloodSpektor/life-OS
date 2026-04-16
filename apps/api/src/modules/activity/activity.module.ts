import { Module } from '@nestjs/common';
import { WorkoutModule } from './workout-log/workout.module';

@Module({
  imports: [WorkoutModule],
})
export class ActivityModule {}
