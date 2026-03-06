import { Injectable } from "@nestjs/common";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { personals } from "@config/database/schema/personals";
import { plans } from "@config/database/schema/plans";
import { students } from "@config/database/schema/students";

export interface RawStats {
  mrr: number;
  totalSubscribers: number;
  newSubscribers: number;
  churnCount: number;
  totalStudents: number;
}

export interface PlanDistributionItem {
  planName: string;
  count: number;
  percentage: number;
}

export interface RevenueTimelineItem {
  month: string;
  mrr: number;
}

@Injectable()
export class DashboardRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async getStats(since: Date | null, until: Date | null): Promise<RawStats> {
    const db = this.drizzle.db;

    const periodCondition = since
      ? and(gte(personals.updatedAt, since), until ? lt(personals.updatedAt, until) : undefined)
      : undefined;

    const [mrrResult, totalResult, newResult, churnResult, studentsResult] = await Promise.all([
      // MRR: sum plan prices for all active subscriptions (not period-filtered)
      db
        .select({ total: sql<string>`COALESCE(SUM(CAST(${plans.price} AS DECIMAL)), 0)` })
        .from(personals)
        .leftJoin(plans, eq(personals.subscriptionPlanId, plans.id))
        .where(eq(personals.subscriptionStatus, "active")),

      // Total active subscribers (not period-filtered)
      db
        .select({ total: count() })
        .from(personals)
        .where(eq(personals.subscriptionStatus, "active")),

      // New subscribers in period (status became active within range)
      db
        .select({ total: count() })
        .from(personals)
        .where(and(eq(personals.subscriptionStatus, "active"), periodCondition)),

      // Churn in period (subscriptions canceled within range)
      db
        .select({ total: count() })
        .from(personals)
        .where(and(eq(personals.subscriptionStatus, "canceled"), periodCondition)),

      // Total students on platform
      db.select({ total: count() }).from(students),
    ]);

    return {
      mrr: parseFloat(mrrResult[0].total),
      totalSubscribers: Number(totalResult[0].total),
      newSubscribers: Number(newResult[0].total),
      churnCount: Number(churnResult[0].total),
      totalStudents: Number(studentsResult[0].total),
    };
  }

  async getPlanDistribution(): Promise<PlanDistributionItem[]> {
    const db = this.drizzle.db;

    const rows = await db
      .select({
        planName: plans.name,
        count: count(),
      })
      .from(personals)
      .innerJoin(plans, eq(personals.subscriptionPlanId, plans.id))
      .where(eq(personals.subscriptionStatus, "active"))
      .groupBy(plans.name);

    const total = rows.reduce((sum, r) => sum + Number(r.count), 0);

    return rows.map((r) => ({
      planName: r.planName,
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
    }));
  }

  async getRevenueTimeline(months: number): Promise<RevenueTimelineItem[]> {
    const db = this.drizzle.db;

    // Generate a series of the last N months and LEFT JOIN with active subscriptions
    const rows = await db.execute(
      sql`
        SELECT
          TO_CHAR(gs.month, 'YYYY-MM') AS month,
          COALESCE(SUM(CAST(p.price AS DECIMAL)), 0) AS mrr
        FROM generate_series(
          DATE_TRUNC('month', NOW() - INTERVAL '1 month' * ${months - 1}),
          DATE_TRUNC('month', NOW()),
          INTERVAL '1 month'
        ) AS gs(month)
        LEFT JOIN ${personals} pe ON
          pe.subscription_status = 'active'
          AND DATE_TRUNC('month', pe.updated_at) <= gs.month
        LEFT JOIN ${plans} p ON p.id = pe.subscription_plan_id
        GROUP BY gs.month
        ORDER BY gs.month ASC
      `,
    );

    return (rows as unknown as { month: string; mrr: string }[]).map((r) => ({
      month: r.month,
      mrr: parseFloat(r.mrr),
    }));
  }
}
