import { Module } from "@nestjs/common";

import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";

import { UpdateWorkoutDayController } from "./contexts/updateWorkoutDay/updateWorkoutDay.controller";
import { UpdateWorkoutDayUseCase } from "./contexts/updateWorkoutDay/updateWorkoutDay.useCase";

@Module({
  controllers: [UpdateWorkoutDayController],
  providers: [WorkoutDaysRepository, UpdateWorkoutDayUseCase],
})
export class WorkoutDaysModule {}
