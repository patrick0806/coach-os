import { Injectable } from "@nestjs/common";
import { subDays } from "date-fns";

import { DashboardRepository } from "@shared/repositories/dashboard.repository";

import { StatsDTO } from "./dtos/response.dto";

export type PeriodFilter = "7d" | "30d" | "90d" | "all";

function resolvePeriod(period: PeriodFilter): { since: Date | null; until: Date | null } {
  const now = new Date();
  if (period === "all") return { since: null, until: null };

  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const daysBack = daysMap[period];
  const since = subDays(now, daysBack);
  return { since, until: now };
}

@Injectable()
export class GetStatsService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(period: PeriodFilter): Promise<StatsDTO> {
    const { since, until } = resolvePeriod(period);

    const stats = await this.dashboardRepository.getStats(since, until);

    const churnRate =
      stats.totalSubscribers > 0
        ? parseFloat(((stats.churnCount / stats.totalSubscribers) * 100).toFixed(1))
        : 0;

    return {
      mrr: stats.mrr,
      totalSubscribers: stats.totalSubscribers,
      newSubscribers: stats.newSubscribers,
      churnRate,
      totalStudents: stats.totalStudents,
    };
  }
}
