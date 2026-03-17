import { Module } from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";
import { WorkoutSessionsRepository } from "@shared/repositories/workoutSessions.repository";

import { StartWorkoutSessionController } from "./contexts/startSession/startSession.controller";
import { StartWorkoutSessionUseCase } from "./contexts/startSession/startSession.useCase";
import { PauseWorkoutSessionController } from "./contexts/pauseSession/pauseSession.controller";
import { PauseWorkoutSessionUseCase } from "./contexts/pauseSession/pauseSession.useCase";
import { FinishWorkoutSessionController } from "./contexts/finishSession/finishSession.controller";
import { FinishWorkoutSessionUseCase } from "./contexts/finishSession/finishSession.useCase";
import { ListWorkoutSessionsController } from "./contexts/listSessions/listSessions.controller";
import { ListWorkoutSessionsUseCase } from "./contexts/listSessions/listSessions.useCase";
import { GetWorkoutSessionController } from "./contexts/getSession/getSession.controller";
import { GetWorkoutSessionUseCase } from "./contexts/getSession/getSession.useCase";

@Module({
  controllers: [
    StartWorkoutSessionController,
    PauseWorkoutSessionController,
    FinishWorkoutSessionController,
    ListWorkoutSessionsController,
    GetWorkoutSessionController,
  ],
  providers: [
    DrizzleProvider,
    StudentsRepository,
    WorkoutDaysRepository,
    WorkoutSessionsRepository,
    StartWorkoutSessionUseCase,
    PauseWorkoutSessionUseCase,
    FinishWorkoutSessionUseCase,
    ListWorkoutSessionsUseCase,
    GetWorkoutSessionUseCase,
  ],
  exports: [WorkoutSessionsRepository],
})
export class SessionsModule {}
