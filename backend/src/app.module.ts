import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { JWTAuthGuard, RolesGuard } from "@shared/guards";

import { HealthModule } from "@modules/health/health.module";
import { AuthModule } from "@modules/auth/auth.module";
import { PersonalsModule } from "@modules/personals/personals.module";
import { StudentsModule } from "@modules/students/students.module";
import { WorkoutsModule } from "@modules/workouts/workouts.module";
import { WorkoutPlansModule } from "@modules/workouts/workout-plans.module";
import { SchedulingModule } from "@modules/scheduling/scheduling.module";
import { ServicePlansModule } from "@modules/scheduling/service-plans.module";
import { BookingsModule } from "@modules/bookings/bookings.module";

import { DatabaseModule } from "@config/database/database.module";

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule,
    PersonalsModule,
    StudentsModule,
    WorkoutsModule,
    WorkoutPlansModule,
    SchedulingModule,
    ServicePlansModule,
    BookingsModule,
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
        path: "personals",
        module: PersonalsModule,
      },
      {
        path: "students",
        module: StudentsModule,
      },
      {
        path: "exercises",
        module: WorkoutsModule,
      },
      {
        path: "workout-plans",
        module: WorkoutPlansModule,
      },
      {
        path: "availability",
        module: SchedulingModule,
      },
      {
        path: "service-plans",
        module: ServicePlansModule,
      },
      {
        path: "",
        module: BookingsModule,
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
  ],
})
export class AppModule { }
