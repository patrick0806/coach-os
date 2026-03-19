import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { plans } from "@config/database/schema/plans";
import type { InferSelectModel } from "drizzle-orm";

export type Plan = InferSelectModel<typeof plans>;

@Injectable()
export class PlansRepository {
  constructor(private readonly drizzle: DrizzleProvider) { }

  async findById(id: string): Promise<Plan | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(plans)
      .where(and(eq(plans.id, id), eq(plans.isActive, true)))
      .limit(1);

    return result[0];
  }

  async findDefault(): Promise<Plan | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(plans)
      .where(and(eq(plans.isDefault, true), eq(plans.isActive, true)))
      .limit(1);

    return result[0];
  }

  async findByStripePriceId(stripePriceId: string): Promise<Plan | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(plans)
      .where(and(eq(plans.stripePriceId, stripePriceId), eq(plans.isActive, true)))
      .limit(1);

    return result[0];
  }

  async findAll(): Promise<Plan[]> {
    return this.drizzle.db
      .select()
      .from(plans)
      .where(eq(plans.isActive, true))
      .orderBy(plans.order);
  }

  async findAllAdmin(): Promise<Plan[]> {
    return this.drizzle.db
      .select()
      .from(plans)
      .orderBy(plans.order);
  }

  async create(data: {
    name: string;
    price: string;
    maxStudents: number;
    description?: string;
    highlighted?: boolean;
    order?: number;
    benefits?: string[];
    stripePriceId?: string;
    isDefault?: boolean;
  }): Promise<Plan> {
    // Drizzle ORM type inference limitation: some optional fields not inferred in INSERT type

    const result = await this.drizzle.db
      .insert(plans)
      .values(data as any)
      .returning();
    return result[0];
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      price: string;
      maxStudents: number;
      description: string | null;
      highlighted: boolean;
      order: number;
      benefits: string[] | null;
      stripePriceId: string | null;
      isDefault: boolean;
      isActive: boolean;
    }>,
  ): Promise<Plan | undefined> {
    // Drizzle ORM type inference limitation: nullable columns not inferred in SET type

    const result = await this.drizzle.db
      .update(plans)
      .set(data as any)
      .where(eq(plans.id, id))
      .returning();
    return result[0];
  }

  async deleteById(id: string): Promise<void> {
    // Soft delete: set isActive to false
    await this.drizzle.db
      .update(plans)
      .set({ isActive: false } as any)
      .where(eq(plans.id, id));
  }
}
