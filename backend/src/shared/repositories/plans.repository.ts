import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { plans, Plans, CreatePlan } from "@config/database/schema/plans";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface UpdatePlanInput {
  name?: string;
  description?: string;
  price?: string;
  benefits?: string[];
  highlighted?: boolean;
  order?: number;
  maxStudents?: number | null;
  stripePriceId?: string | null;
}

export interface ReorderItem {
  id: string;
  order: number;
}

@Injectable()
export class PlansRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findById(id: string, tx?: DrizzleDb): Promise<Plans | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findAllActive(tx?: DrizzleDb): Promise<Plans[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(plans)
      .where(eq(plans.isActive, true))
      .orderBy(plans.order);
  }

  async findAll(tx?: DrizzleDb): Promise<Plans[]> {
    const db = tx ?? this.drizzle.db;
    return db.select().from(plans).orderBy(plans.order);
  }

  async create(data: Omit<CreatePlan, "id" | "createdAt" | "updatedAt">, tx?: DrizzleDb): Promise<Plans> {
    const db = tx ?? this.drizzle.db;
     
    const result = await db.insert(plans).values(data as any).returning();
    return result[0];
  }

  async update(id: string, data: UpdatePlanInput, tx?: DrizzleDb): Promise<Plans> {
    const db = tx ?? this.drizzle.db;
     
    const result = await db.update(plans).set(data as any).where(eq(plans.id, id)).returning();
    return result[0];
  }

  async updateStatus(id: string, isActive: boolean, tx?: DrizzleDb): Promise<Plans> {
    const db = tx ?? this.drizzle.db;
     
    const result = await db.update(plans).set({ isActive } as any).where(eq(plans.id, id)).returning();
    return result[0];
  }

  async updateOrder(items: ReorderItem[], tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await Promise.all(
      items.map(({ id, order }) =>
         
        db.update(plans).set({ order } as any).where(eq(plans.id, id)),
      ),
    );
  }
}
