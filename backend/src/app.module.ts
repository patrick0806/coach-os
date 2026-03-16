import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { JWTAuthGuard, RolesGuard, TenantAccessGuard } from "@shared/guards";

import { HealthModule } from "@modules/health/health.module";
import { AuthModule } from "@modules/auth/auth.module";
import { PlansModule } from "@modules/platform/plans/plans.module";
import { StudentsModule } from "@modules/students/students.module";
import { CoachingNotesModule } from "@modules/coaching/notes/notes.module";
import { CoachingRelationsModule } from "@modules/coaching/relations/relations.module";

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
