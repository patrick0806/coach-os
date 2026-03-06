import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { students, Student } from "@config/database/schema/students";

type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class StudentsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findByUserId(userId: string, tx?: DrizzleDb): Promise<Student | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(students)
      .where(eq(students.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }
}
