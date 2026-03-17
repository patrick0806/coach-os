import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { JWTAuthGuard, RolesGuard, TenantAccessGuard } from "@shared/guards";

import { HealthModule } from "@modules/health/health.module";
import { AuthModule } from "@modules/auth/auth.module";
import { PlansModule } from "@modules/platform/plans/plans.module";
import { StudentsModule } from "@modules/students/students.module";
import { CoachingNotesModule } from "@modules/coaching/notes/notes.module";
import { CoachingRelationsModule } from "@modules/coaching/relations/relations.module";
import { ExercisesModule } from "@modules/exercises/exercises.module";
import { ProgramTemplatesModule } from "@modules/training/programTemplates/programTemplates.module";
import { WorkoutTemplatesModule } from "@modules/training/workoutTemplates/workoutTemplates.module";
import { ExerciseTemplatesModule } from "@modules/training/exerciseTemplates/exerciseTemplates.module";

import { DatabaseModule } from "@config/database/database.module";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    HealthModule,
    PlansModule,
    StudentsModule,
    CoachingNotesModule,
    CoachingRelationsModule,
    ExercisesModule,
    ProgramTemplatesModule,
    WorkoutTemplatesModule,
    ExerciseTemplatesModule,
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
        path: "students",
        module: StudentsModule,
      },
      {
        path: "coach-student-relations",
        module: CoachingRelationsModule,
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
  ],
})
export class AppModule { }
