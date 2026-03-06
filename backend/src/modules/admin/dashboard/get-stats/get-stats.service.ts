import { Injectable } from "@nestjs/common";

import { DashboardRepository } from "@shared/repositories/dashboard.repository";

import { StatsDTO } from "./dtos/response.dto";

export type PeriodFilter = "7d" | "30d" | "90d" | "all";

function resolvePeriod(period: PeriodFilter): { since: Date | null; until: Date | null; daysBack: number | null } {
  const now = new Date();
  if (period === "all") return { since: null, until: null, daysBack: null };

  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const daysBack = daysMap[period];
  const since = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return { since, until: now, daysBack };
}

@Injectable()
export class GetStatsService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(period: PeriodFilter): Promise<StatsDTO> {
    const { since, until, daysBack } = resolvePeriod(period);

    // Fetch current period and previous period in parallel
    const previousSince = since && daysBack
      ? new Date(since.getTime() - daysBack * 24 * 60 * 60 * 1000)
      : null;

    const [current, previous] = await Promise.all([
      this.dashboardRepository.getStats(since, until),
      this.dashboardRepository.getStats(previousSince, since),
    ]);

    let growthRate: number | null = null;
    if (previous.newSubscribers > 0) {
      growthRate = Math.round(((current.newSubscribers - previous.newSubscribers) / previous.newSubscribers) * 100);
    } else if (current.newSubscribers === 0) {
      growthRate = 0;
    }

    return {
      mrr: current.mrr,
      totalSubscribers: current.totalSubscribers,
      newSubscribers: current.newSubscribers,
      churnCount: current.churnCount,
      totalStudents: current.totalStudents,
      growthRate,
    };
  }
}
