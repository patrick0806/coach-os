import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";

import { JWTAuthGuard, RolesGuard, TenantAccessGuard } from "@shared/guards";

import { HealthModule } from "@modules/health/health.module";
import { AuthModule } from "@modules/auth/auth.module";
import { PlansModule } from "@modules/platform/plans/plans.module";
import { ProfileModule } from "@modules/platform/profile/profile.module";
import { DashboardModule } from "@modules/platform/dashboard/dashboard.module";
import { StudentsModule } from "@modules/students/students.module";
import { CoachingNotesModule } from "@modules/coaching/notes/notes.module";
import { CoachingRelationsModule } from "@modules/coaching/relations/relations.module";
import { ServicePlansModule } from "@modules/coaching/servicePlans/servicePlans.module";
import { ExercisesModule } from "@modules/exercises/exercises.module";
import { ProgramTemplatesModule } from "@modules/training/programTemplates/programTemplates.module";
import { WorkoutTemplatesModule } from "@modules/training/workoutTemplates/workoutTemplates.module";
import { ExerciseTemplatesModule } from "@modules/training/exerciseTemplates/exerciseTemplates.module";
import { StudentProgramsModule } from "@modules/training/studentPrograms/studentPrograms.module";
import { WorkoutDaysModule } from "@modules/training/workoutDays/workoutDays.module";
import { StudentExercisesModule } from "@modules/training/studentExercises/studentExercises.module";
import { SessionsModule } from "@modules/workoutExecution/sessions/sessions.module";
import { ExerciseExecutionsModule } from "@modules/workoutExecution/exerciseExecutions/exerciseExecutions.module";
import { ExerciseSetsModule } from "@modules/workoutExecution/exerciseSets/exerciseSets.module";
import { ProgressRecordsModule } from "@modules/progress/records/records.module";
import { ProgressPhotosModule } from "@modules/progress/photos/photos.module";
import { ProgressCheckinsModule } from "@modules/progress/checkins/checkins.module";
import { PublicModule } from "@modules/public/public.module";
import { CoachingContractsModule } from "@modules/coaching/contracts/contracts.module";
import { EnumsModule } from "@modules/enums/enums.module";
import { WebhooksModule } from "@modules/platform/webhooks/webhooks.module";
import { SubscriptionsModule } from "@modules/platform/subscriptions/subscriptions.module";
import { AdminModule } from "@modules/platform/admin/admin.module";
import { SchedulingModule } from "@modules/scheduling/scheduling.module";

import { DatabaseModule } from "@config/database/database.module";
import { JobsModule } from "./jobs/jobs.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 60_000,
        limit: process.env.NODE_ENV !== "production" ? 100 : 10,
      },
      {
        name: "long",
        ttl: 600_000,
        limit: process.env.NODE_ENV !== "production" ? 500 : 50,
      },
    ]),
    DatabaseModule,
    AuthModule,
    HealthModule,
    PlansModule,
    ProfileModule,
    DashboardModule,
    StudentsModule,
    CoachingNotesModule,
    CoachingRelationsModule,
    ServicePlansModule,
    ExercisesModule,
    ProgramTemplatesModule,
    WorkoutTemplatesModule,
    ExerciseTemplatesModule,
    StudentProgramsModule,
    WorkoutDaysModule,
    StudentExercisesModule,
    SessionsModule,
    ExerciseExecutionsModule,
    ExerciseSetsModule,
    ProgressRecordsModule,
    ProgressPhotosModule,
    ProgressCheckinsModule,
    PublicModule,
    CoachingContractsModule,
    EnumsModule,
    WebhooksModule,
    SubscriptionsModule,
    AdminModule,
    SchedulingModule,
    JobsModule,
    RouterModule.register([
      {
        path: "health",
        module: HealthModule,
      },
      {
        path: "auth",
        module: AuthModule,
      },
      {
        path: "plans",
        module: PlansModule,
      },
      {
        path: "profile",
        module: ProfileModule,
      },
      {
        path: "dashboard",
        module: DashboardModule,
      },
      {
        path: "students",
        module: StudentsModule,
      },
      {
        path: "coach-student-relations",
        module: CoachingRelationsModule,
      },
      {
        path: "service-plans",
        module: ServicePlansModule,
      },
      {
        path: "exercises",
        module: ExercisesModule,
      },
      {
        path: "program-templates",
        module: ProgramTemplatesModule,
      },
      {
        path: "workout-templates",
        module: WorkoutTemplatesModule,
      },
      {
        path: "exercise-templates",
        module: ExerciseTemplatesModule,
      },
      {
        path: "student-programs",
        module: StudentProgramsModule,
      },
      {
        path: "workout-days",
        module: WorkoutDaysModule,
      },
      {
        path: "student-exercises",
        module: StudentExercisesModule,
      },
      {
        path: "workout-sessions",
        module: SessionsModule,
      },
      {
        path: "exercise-executions",
        module: ExerciseExecutionsModule,
      },
      {
        path: "exercise-sets",
        module: ExerciseSetsModule,
      },
      {
        path: "public",
        module: PublicModule,
      },
      {
        path: "enums",
        module: EnumsModule,
      },
      {
        path: "webhooks",
        module: WebhooksModule,
      },
      {
        path: "subscriptions",
        module: SubscriptionsModule,
      },
      {
        path: "admin",
        module: AdminModule,
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: "APP_GUARD",
      useClass: JWTAuthGuard,
    },
    {
      provide: "APP_GUARD",
      useClass: RolesGuard,
    },
    {
      provide: "APP_GUARD",
      useClass: TenantAccessGuard,
    },
    {
      provide: "APP_GUARD",
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
