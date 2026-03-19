import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { admins } from "@config/database/schema/admins";
import { users } from "@config/database/schema/users";
import type { InferSelectModel } from "drizzle-orm";

export type Admin = InferSelectModel<typeof admins>;
export type AdminWithUser = Admin & { name: string; email: string };

@Injectable()
export class AdminsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async findById(id: string): Promise<Admin | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1);
    return result[0];
  }

  async findByUserId(userId: string): Promise<Admin | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(admins)
      .where(eq(admins.userId, userId))
      .limit(1);
    return result[0];
  }

  async create(data: { userId: string }): Promise<Admin> {
    const result = await this.drizzle.db
      .insert(admins)
      .values(data)
      .returning();
    return result[0];
  }

  async findAll(): Promise<AdminWithUser[]> {
    const result = await this.drizzle.db
      .select({
        id: admins.id,
        userId: admins.userId,
        createdAt: admins.createdAt,
        updatedAt: admins.updatedAt,
        name: users.name,
        email: users.email,
      })
      .from(admins)
      .innerJoin(users, eq(admins.userId, users.id));
    return result as AdminWithUser[];
  }

  async deleteById(id: string): Promise<void> {
    await this.drizzle.db.delete(admins).where(eq(admins.id, id));
  }
}
