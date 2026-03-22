import { Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import { coachingContracts } from "@config/database/schema/coaching";
import { servicePlans } from "@config/database/schema/coaching";

export type CoachingContract = InferSelectModel<typeof coachingContracts>;

export interface ContractWithPlan extends CoachingContract {
  servicePlan: {
    id: string;
    name: string;
    price: string;
    attendanceType: "online" | "presential";
    sessionsPerWeek: number | null;
    durationMinutes: number | null;
  };
}

@Injectable()
export class CoachingContractsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    studentId: string;
    servicePlanId: string;
    status: "active" | "cancelled" | "expired";
    startDate: Date;
    endDate?: Date | null;
  }, tx?: DbTransaction): Promise<CoachingContract> {
    const result = await (tx ?? this.drizzle.db)
      .insert(coachingContracts)
      .values(data)
      .returning();

    return result[0];
  }

  async findByStudentId(studentId: string, tenantId: string): Promise<ContractWithPlan[]> {
    const rows = await this.drizzle.db
      .select({
        id: coachingContracts.id,
        tenantId: coachingContracts.tenantId,
        studentId: coachingContracts.studentId,
        servicePlanId: coachingContracts.servicePlanId,
        status: coachingContracts.status,
        startDate: coachingContracts.startDate,
        endDate: coachingContracts.endDate,
        createdAt: coachingContracts.createdAt,
        updatedAt: coachingContracts.updatedAt,
        servicePlanDbId: servicePlans.id,
        servicePlanName: servicePlans.name,
        servicePlanPrice: servicePlans.price,
        servicePlanAttendanceType: servicePlans.attendanceType,
        servicePlanSessionsPerWeek: servicePlans.sessionsPerWeek,
        servicePlanDurationMinutes: servicePlans.durationMinutes,
      })
      .from(coachingContracts)
      .innerJoin(servicePlans, eq(coachingContracts.servicePlanId, servicePlans.id))
      .where(
        and(
          eq(coachingContracts.studentId, studentId),
          eq(coachingContracts.tenantId, tenantId),
        ),
      )
      .orderBy(desc(coachingContracts.createdAt));

    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      studentId: row.studentId,
      servicePlanId: row.servicePlanId,
      status: row.status as "active" | "cancelled" | "expired",
      startDate: row.startDate,
      endDate: row.endDate ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      servicePlan: {
        id: row.servicePlanDbId,
        name: row.servicePlanName,
        price: row.servicePlanPrice,
        attendanceType: row.servicePlanAttendanceType as "online" | "presential",
        sessionsPerWeek: row.servicePlanSessionsPerWeek,
        durationMinutes: row.servicePlanDurationMinutes,
      },
    }));
  }

  async findActiveByStudentId(studentId: string, tenantId: string): Promise<ContractWithPlan | undefined> {
    const rows = await this.drizzle.db
      .select({
        id: coachingContracts.id,
        tenantId: coachingContracts.tenantId,
        studentId: coachingContracts.studentId,
        servicePlanId: coachingContracts.servicePlanId,
        status: coachingContracts.status,
        startDate: coachingContracts.startDate,
        endDate: coachingContracts.endDate,
        createdAt: coachingContracts.createdAt,
        updatedAt: coachingContracts.updatedAt,
        servicePlanDbId: servicePlans.id,
        servicePlanName: servicePlans.name,
        servicePlanPrice: servicePlans.price,
        servicePlanAttendanceType: servicePlans.attendanceType,
        servicePlanSessionsPerWeek: servicePlans.sessionsPerWeek,
        servicePlanDurationMinutes: servicePlans.durationMinutes,
      })
      .from(coachingContracts)
      .innerJoin(servicePlans, eq(coachingContracts.servicePlanId, servicePlans.id))
      .where(
        and(
          eq(coachingContracts.studentId, studentId),
          eq(coachingContracts.tenantId, tenantId),
          eq(coachingContracts.status, "active"),
        ),
      )
      .limit(1);

    if (!rows[0]) return undefined;

    const row = rows[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      studentId: row.studentId,
      servicePlanId: row.servicePlanId,
      status: row.status as "active" | "cancelled" | "expired",
      startDate: row.startDate,
      endDate: row.endDate ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      servicePlan: {
        id: row.servicePlanDbId,
        name: row.servicePlanName,
        price: row.servicePlanPrice,
        attendanceType: row.servicePlanAttendanceType as "online" | "presential",
        sessionsPerWeek: row.servicePlanSessionsPerWeek,
        durationMinutes: row.servicePlanDurationMinutes,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<ContractWithPlan | undefined> {
    const rows = await this.drizzle.db
      .select({
        id: coachingContracts.id,
        tenantId: coachingContracts.tenantId,
        studentId: coachingContracts.studentId,
        servicePlanId: coachingContracts.servicePlanId,
        status: coachingContracts.status,
        startDate: coachingContracts.startDate,
        endDate: coachingContracts.endDate,
        createdAt: coachingContracts.createdAt,
        updatedAt: coachingContracts.updatedAt,
        servicePlanDbId: servicePlans.id,
        servicePlanName: servicePlans.name,
        servicePlanPrice: servicePlans.price,
        servicePlanAttendanceType: servicePlans.attendanceType,
        servicePlanSessionsPerWeek: servicePlans.sessionsPerWeek,
        servicePlanDurationMinutes: servicePlans.durationMinutes,
      })
      .from(coachingContracts)
      .innerJoin(servicePlans, eq(coachingContracts.servicePlanId, servicePlans.id))
      .where(and(eq(coachingContracts.id, id), eq(coachingContracts.tenantId, tenantId)))
      .limit(1);

    if (!rows[0]) return undefined;

    const row = rows[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      studentId: row.studentId,
      servicePlanId: row.servicePlanId,
      status: row.status as "active" | "cancelled" | "expired",
      startDate: row.startDate,
      endDate: row.endDate ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      servicePlan: {
        id: row.servicePlanDbId,
        name: row.servicePlanName,
        price: row.servicePlanPrice,
        attendanceType: row.servicePlanAttendanceType as "online" | "presential",
        sessionsPerWeek: row.servicePlanSessionsPerWeek,
        durationMinutes: row.servicePlanDurationMinutes,
      },
    };
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<Pick<CoachingContract, "status" | "endDate">>,
    tx?: DbTransaction,
  ): Promise<CoachingContract | undefined> {
    const result = await (tx ?? this.drizzle.db)
      .update(coachingContracts)
      .set(data)
      .where(and(eq(coachingContracts.id, id), eq(coachingContracts.tenantId, tenantId)))
      .returning();

    return result[0];
  }
}
