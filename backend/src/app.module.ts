import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { JWTAuthGuard, RolesGuard } from "@shared/guards";

import { HealthModule } from "@modules/health/health.module";

import { DatabaseModule } from "@config/database/database.module";

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    RouterModule.register([
      {
        path: "health",
        module: HealthModule,
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
