import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { JWTAuthGuard, RolesGuard, TenantAccessGuard } from "@shared/guards";

import { HealthModule } from "@modules/health/health.module";
import { AuthModule } from "@modules/auth/auth.module";
import { PersonalsModule } from "@modules/personals/personals.module";
import { StudentsModule } from "@modules/students/students.module";
import { WorkoutsModule } from "@modules/workouts/workouts.module";
import { WorkoutPlansModule } from "@modules/workouts/workout-plans.module";
import { SchedulingModule } from "@modules/scheduling/scheduling.module";
import { ServicePlansModule } from "@modules/scheduling/service-plans.module";
import { BookingsModule } from "@modules/bookings/bookings.module";
import { PlansModule } from "@modules/plans/plans.module";
import { SubscriptionsModule } from "@modules/subscriptions/subscriptions.module";
import { AdminModule } from "@modules/admin/admin.module";
import { SupportModule } from "@modules/support/support.module";
import { WorkoutSessionsModule } from "@modules/workout-sessions/workout-sessions.module";

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
    PlansModule,
    SubscriptionsModule,
    AdminModule,
    SupportModule,
    WorkoutSessionsModule,
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
      {
        path: "plans",
        module: PlansModule,
      },
      {
        path: "subscriptions",
        module: SubscriptionsModule,
      },
      {
        path: "admin",
        module: AdminModule,
      },
      {
        path: "support",
        module: SupportModule,
      },
      {
        path: "workout-sessions",
        module: WorkoutSessionsModule,
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
