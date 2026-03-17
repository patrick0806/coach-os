import { Module } from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { WorkoutSessionsRepository } from "@shared/repositories/workoutSessions.repository";
import { ExerciseExecutionsRepository } from "@shared/repositories/exerciseExecutions.repository";

import { CreateExerciseExecutionController } from "./contexts/createExecution/createExecution.controller";
import { CreateExerciseExecutionUseCase } from "./contexts/createExecution/createExecution.useCase";

@Module({
  controllers: [CreateExerciseExecutionController],
  providers: [
    DrizzleProvider,
    WorkoutSessionsRepository,
    ExerciseExecutionsRepository,
    CreateExerciseExecutionUseCase,
  ],
  exports: [ExerciseExecutionsRepository],
})
export class ExerciseExecutionsModule {}
