import { Injectable } from "@nestjs/common";
import { and, eq, gte, lte } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { availabilityExceptions } from "@config/database/schema/scheduling";

export type AvailabilityException = InferSelectModel<
  typeof availabilityExceptions
>;

@Injectable()
export class AvailabilityExceptionsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    exceptionDate: string;
    reason?: string;
  }): Promise<AvailabilityException> {
    const result = await this.drizzle.db
      .insert(availabilityExceptions)
      .values(data)
      .returning();

    return result[0];
  }

  async findByTenantId(tenantId: string): Promise<AvailabilityException[]> {
    return this.drizzle.db
      .select()
      .from(availabilityExceptions)
      .where(eq(availabilityExceptions.tenantId, tenantId))
      .orderBy(availabilityExceptions.exceptionDate);
  }

  async findByDateRange(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<AvailabilityException[]> {
    return this.drizzle.db
      .select()
      .from(availabilityExceptions)
      .where(
        and(
          eq(availabilityExceptions.tenantId, tenantId),
          gte(availabilityExceptions.exceptionDate, startDate),
          lte(availabilityExceptions.exceptionDate, endDate),
        ),
      )
      .orderBy(availabilityExceptions.exceptionDate);
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<AvailabilityException | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(availabilityExceptions)
      .where(
        and(
          eq(availabilityExceptions.id, id),
          eq(availabilityExceptions.tenantId, tenantId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .delete(availabilityExceptions)
      .where(
        and(
          eq(availabilityExceptions.id, id),
          eq(availabilityExceptions.tenantId, tenantId),
        ),
      )
      .returning();

    return result.length > 0;
  }
}
