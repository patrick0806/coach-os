import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { ScheduleRulesRepository } from "@shared/repositories/schedule-rules.repository";
import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { ResendProvider } from "@shared/providers/resend.provider";

import { ScheduleEngineService } from "./contexts/schedule-engine/schedule-engine.service";

import { UpsertScheduleRulesController } from "./contexts/upsert-schedule-rules/upsert-schedule-rules.controller";
import { UpsertScheduleRulesService } from "./contexts/upsert-schedule-rules/upsert-schedule-rules.service";

import { GetScheduleRulesController } from "./contexts/get-schedule-rules/get-schedule-rules.controller";
import { GetScheduleRulesService } from "./contexts/get-schedule-rules/get-schedule-rules.service";

import { ListTrainingSessionsController } from "./contexts/list-training-sessions/list-training-sessions.controller";
import { ListTrainingSessionsService } from "./contexts/list-training-sessions/list-training-sessions.service";

import { TodaySessionController } from "./contexts/today-session/today-session.controller";
import { TodaySessionService } from "./contexts/today-session/today-session.service";

import { WeekSessionsController } from "./contexts/week-sessions/week-sessions.controller";
import { WeekSessionsService } from "./contexts/week-sessions/week-sessions.service";

import { CancelTrainingSessionController } from "./contexts/cancel-training-session/cancel-training-session.controller";
import { CancelTrainingSessionService } from "./contexts/cancel-training-session/cancel-training-session.service";
import { CompleteTrainingSessionController } from "./contexts/complete-training-session/complete-training-session.controller";
import { CompleteTrainingSessionService } from "./contexts/complete-training-session/complete-training-session.service";

import { ActivityHistoryController } from "./contexts/activity-history/activity-history.controller";
import { ActivityHistoryService } from "./contexts/activity-history/activity-history.service";

@Module({
  imports: [
    // Enables the NestJS cron job system
    ScheduleModule.forRoot(),
  ],
  controllers: [
    UpsertScheduleRulesController,
    GetScheduleRulesController,
    ListTrainingSessionsController,
    TodaySessionController,
    WeekSessionsController,
    CancelTrainingSessionController,
    CompleteTrainingSessionController,
    ActivityHistoryController,
  ],
  providers: [
    ScheduleEngineService,
    UpsertScheduleRulesService,
    GetScheduleRulesService,
    ListTrainingSessionsService,
    TodaySessionService,
    WeekSessionsService,
    CancelTrainingSessionService,
    CompleteTrainingSessionService,
    ActivityHistoryService,
    // Repositories
    StudentsRepository,
    ScheduleRulesRepository,
    TrainingSessionsRepository,
    // Providers
    ResendProvider,
  ],
  exports: [
    ScheduleEngineService,
    ScheduleRulesRepository,
    TrainingSessionsRepository,
  ],
})
export class TrainingScheduleModule {}
