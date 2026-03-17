import { Injectable } from "@nestjs/common";
import { and, count, eq } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { students } from "@config/database/schema/students";
import { programTemplates, studentPrograms } from "@config/database/schema/training";

export interface DashboardCounts {
  activeStudents: number;
  totalStudents: number;
  programTemplates: number;
  activeStudentPrograms: number;
}

@Injectable()
export class DashboardRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async getCounts(tenantId: string): Promise<DashboardCounts> {
    const [
      activeStudentsResult,
      totalStudentsResult,
      programTemplatesResult,
      activeStudentProgramsResult,
    ] = await Promise.all([
      this.drizzle.db
        .select({ value: count() })
        .from(students)
        .where(and(eq(students.tenantId, tenantId), eq(students.status, "active"))),

      this.drizzle.db
        .select({ value: count() })
        .from(students)
        .where(eq(students.tenantId, tenantId)),

      this.drizzle.db
        .select({ value: count() })
        .from(programTemplates)
        .where(
          and(
            eq(programTemplates.tenantId, tenantId),
            eq(programTemplates.status, "active"),
          ),
        ),

      this.drizzle.db
        .select({ value: count() })
        .from(studentPrograms)
        .where(
          and(
            eq(studentPrograms.tenantId, tenantId),
            eq(studentPrograms.status, "active"),
          ),
        ),
    ]);

    return {
      activeStudents: Number(activeStudentsResult[0]?.value ?? 0),
      totalStudents: Number(totalStudentsResult[0]?.value ?? 0),
      programTemplates: Number(programTemplatesResult[0]?.value ?? 0),
      activeStudentPrograms: Number(activeStudentProgramsResult[0]?.value ?? 0),
    };
  }
}
