import { Module } from "@nestjs/common";

import { WorkoutSessionsRepository } from "@shared/repositories/workout-sessions.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";

import { StartSessionController } from "./contexts/start-session/start-session.controller";
import { StartSessionService } from "./contexts/start-session/start-session.service";
import { UpdateStepController } from "./contexts/update-step/update-step.controller";
import { UpdateStepService } from "./contexts/update-step/update-step.service";
import { CompleteSessionController } from "./contexts/complete-session/complete-session.controller";
import { CompleteSessionService } from "./contexts/complete-session/complete-session.service";

@Module({
  controllers: [StartSessionController, UpdateStepController, CompleteSessionController],
  providers: [
    StartSessionService,
    UpdateStepService,
    CompleteSessionService,
    WorkoutSessionsRepository,
    WorkoutPlanStudentsRepository,
  ],
})
export class WorkoutSessionsModule {}
