import { Injectable } from "@nestjs/common";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { personals } from "@config/database/schema/personals";
import { users } from "@config/database/schema/users";
import { plans } from "@config/database/schema/plans";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface PersonalWithUser {
  id: string;
  userId: string;
  slug: string;
  name: string;
  email: string;
  isActive: boolean;
  subscriptionStatus: string | null;
  subscriptionPlanName: string | null;
  createdAt: Date;
}

export interface PersonalWithUserDetail extends PersonalWithUser {
  subscriptionPlanId: string | null;
  subscriptionExpiresAt: Date | null;
  stripeCustomerId: string | null;
  bio: string | null;
  profilePhoto: string | null;
  phoneNumber: string | null;
}

export interface FindAllPersonalsOptions {
  page: number;
  size: number;
  search?: string;
}

export interface PaginatedPersonals {
  content: PersonalWithUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable()
export class AdminPersonalsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findAllWithUser(options: FindAllPersonalsOptions): Promise<PaginatedPersonals> {
    const db = this.drizzle.db;
    const { page, size, search } = options;
    const offset = (page - 1) * size;

    const searchCondition = search
      ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      : undefined;

    const baseWhere = and(searchCondition);

    const [rows, countResult] = await Promise.all([
      db
        .select({
          id: personals.id,
          userId: personals.userId,
          slug: personals.slug,
          name: users.name,
          email: users.email,
          isActive: users.isActive,
          subscriptionStatus: personals.subscriptionStatus,
          subscriptionPlanName: plans.name,
          createdAt: personals.createdAt,
        })
        .from(personals)
        .innerJoin(users, eq(personals.userId, users.id))
        .leftJoin(plans, eq(personals.subscriptionPlanId, plans.id))
        .where(baseWhere)
        .orderBy(personals.createdAt)
        .limit(size)
        .offset(offset),
      db
        .select({ total: count() })
        .from(personals)
        .innerJoin(users, eq(personals.userId, users.id))
        .where(baseWhere),
    ]);

    const totalElements = Number(countResult[0].total);

    return {
      content: rows,
      page,
      size,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
    };
  }

  async findByIdWithUser(id: string, tx?: DrizzleDb): Promise<PersonalWithUserDetail | null> {
    const db = tx ?? this.drizzle.db;

    const result = await db
      .select({
        id: personals.id,
        userId: personals.userId,
        slug: personals.slug,
        name: users.name,
        email: users.email,
        isActive: users.isActive,
        subscriptionStatus: personals.subscriptionStatus,
        subscriptionPlanId: personals.subscriptionPlanId,
        subscriptionPlanName: plans.name,
        subscriptionExpiresAt: personals.subscriptionExpiresAt,
        stripeCustomerId: personals.stripeCustomerId,
        bio: personals.bio,
        profilePhoto: personals.profilePhoto,
        phoneNumber: personals.phoneNumber,
        createdAt: personals.createdAt,
      })
      .from(personals)
      .innerJoin(users, eq(personals.userId, users.id))
      .leftJoin(plans, eq(personals.subscriptionPlanId, plans.id))
      .where(eq(personals.id, id))
      .limit(1);

    return result[0] ?? null;
  }
}
