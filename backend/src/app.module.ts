import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

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
import { AvailabilityModule } from "@modules/scheduling/availability/availability.module";
import { TrainingSchedulesModule } from "@modules/scheduling/trainingSchedules/trainingSchedules.module";
import { AppointmentsModule } from "@modules/scheduling/appointments/appointments.module";
import { CalendarModule } from "@modules/scheduling/calendar/calendar.module";
import { PublicModule } from "@modules/public/public.module";

import { DatabaseModule } from "@config/database/database.module";

@Module({
  imports: [
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
    AvailabilityModule,
    TrainingSchedulesModule,
    AppointmentsModule,
    CalendarModule,
    PublicModule,
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
        path: "calendar",
        module: CalendarModule,
      },
      {
        path: "public",
        module: PublicModule,
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
