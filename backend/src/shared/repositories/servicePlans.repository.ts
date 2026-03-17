import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { servicePlans } from "@config/database/schema/coaching";

export type ServicePlan = InferSelectModel<typeof servicePlans>;

@Injectable()
export class ServicePlansRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    name: string;
    description?: string | null;
    sessionsPerWeek?: number | null;
    durationMinutes?: number | null;
    price: string;
    attendanceType: "online" | "presential";
  }): Promise<ServicePlan> {
    const result = await this.drizzle.db
      .insert(servicePlans)
      .values(data)
      .returning();

    return result[0];
  }

  async findByTenantId(tenantId: string): Promise<ServicePlan[]> {
    return this.drizzle.db
      .select()
      .from(servicePlans)
      .where(eq(servicePlans.tenantId, tenantId));
  }

  async findActiveByTenantId(tenantId: string): Promise<ServicePlan[]> {
    return this.drizzle.db
      .select()
      .from(servicePlans)
      .where(and(eq(servicePlans.tenantId, tenantId), eq(servicePlans.isActive, true)));
  }

  async findById(id: string, tenantId: string): Promise<ServicePlan | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(servicePlans)
      .where(and(eq(servicePlans.id, id), eq(servicePlans.tenantId, tenantId)))
      .limit(1);

    return result[0];
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<
      Pick<
        ServicePlan,
        "name" | "description" | "sessionsPerWeek" | "durationMinutes" | "price" | "attendanceType" | "isActive"
      >
    >,
  ): Promise<ServicePlan | undefined> {
    const result = await this.drizzle.db
      .update(servicePlans)
      .set(data)
      .where(and(eq(servicePlans.id, id), eq(servicePlans.tenantId, tenantId)))
      .returning();

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.drizzle.db
      .delete(servicePlans)
      .where(and(eq(servicePlans.id, id), eq(servicePlans.tenantId, tenantId)));
  }
}
