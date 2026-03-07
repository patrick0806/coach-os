import { Injectable } from "@nestjs/common";

import { DashboardRepository } from "@shared/repositories/dashboard.repository";

import { ChartsDTO } from "./dtos/response.dto";
import { PeriodFilter } from "../get-stats/get-stats.service";

function periodToMonths(period: PeriodFilter): number {
  const map: Record<PeriodFilter, number> = {
    "7d": 1,
    "30d": 1,
    "90d": 3,
    "all": 12,
  };
  return map[period];
}

@Injectable()
export class GetChartsService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(period: PeriodFilter): Promise<ChartsDTO> {
    const months = periodToMonths(period);

    const [planDistribution, revenueTimeline] = await Promise.all([
      this.dashboardRepository.getPlanDistribution(),
      this.dashboardRepository.getRevenueTimeline(months),
    ]);

    return { planDistribution, revenue: revenueTimeline };
  }
}
