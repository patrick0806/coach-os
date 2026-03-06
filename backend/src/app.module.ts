import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { JWTAuthGuard, RolesGuard } from "@shared/guards";

import { HealthModule } from "@modules/health/health.module";
import { AuthModule } from "@modules/auth/auth.module";
import { PersonalsModule } from "@modules/personals/personals.module";

import { DatabaseModule } from "@config/database/database.module";

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule,
    PersonalsModule,
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
