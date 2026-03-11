import { Injectable } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { servicePlans, ServicePlan } from "@config/database/schema/availability";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreateServicePlanInput {
  personalId: string;
  name: string;
  description?: string | null;
  sessionsPerWeek: number;
  durationMinutes: number;
  price: string;
}

export interface UpdateServicePlanInput {
  name?: string;
  description?: string | null;
  sessionsPerWeek?: number;
  durationMinutes?: number;
  price?: string;
}

@Injectable()
export class ServicePlansRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findActiveByPersonalId(
    personalId: string,
    tx?: DrizzleDb,
  ): Promise<ServicePlan[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(servicePlans)
      .where(
        and(
          eq(servicePlans.personalId, personalId),
          eq(servicePlans.isActive, true),
        ),
      );
  }

  async findAllByPersonalId(personalId: string, tx?: DrizzleDb): Promise<ServicePlan[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(servicePlans)
      .where(eq(servicePlans.personalId, personalId))
      .orderBy(servicePlans.name);
  }

  async findById(id: string, tx?: DrizzleDb): Promise<ServicePlan | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(servicePlans)
      .where(eq(servicePlans.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findOwnedById(id: string, personalId: string, tx?: DrizzleDb): Promise<ServicePlan | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(servicePlans)
      .where(and(eq(servicePlans.id, id), eq(servicePlans.personalId, personalId)))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: CreateServicePlanInput, tx?: DrizzleDb): Promise<ServicePlan> {
    const db = tx ?? this.drizzle.db;
     
    const result = await db.insert(servicePlans).values(data as any).returning();
    return result[0];
  }

  async update(
    id: string,
    personalId: string,
    data: UpdateServicePlanInput,
    tx?: DrizzleDb,
  ): Promise<ServicePlan | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .update(servicePlans)
       
      .set(data as any)
      .where(and(eq(servicePlans.id, id), eq(servicePlans.personalId, personalId)))
      .returning();
    return result[0] ?? null;
  }

  async deactivate(id: string, personalId: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .update(servicePlans)
       
      .set({ isActive: false } as any)
      .where(and(eq(servicePlans.id, id), eq(servicePlans.personalId, personalId)));
  }
}
