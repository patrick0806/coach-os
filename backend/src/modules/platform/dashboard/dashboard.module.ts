import { Module } from "@nestjs/common";

import { DashboardRepository } from "../../../shared/repositories/dashboard.repository";
import { GetStatsController } from "./contexts/getStats/getStats.controller";
import { GetStatsUseCase } from "./contexts/getStats/getStats.useCase";

@Module({
  controllers: [GetStatsController],
  providers: [DashboardRepository, GetStatsUseCase],
})
export class DashboardModule { }
