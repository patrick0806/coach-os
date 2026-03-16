import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { CoachStudentRelationsRepository } from "@shared/repositories/coachStudentRelations.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { validate } from "@shared/utils/validation.util";

const updateStudentStatusSchema = z.object({
  status: z.enum(["active", "paused", "archived"]),
});

@Injectable()
export class UpdateStudentStatusUseCase {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly coachStudentRelationsRepository: CoachStudentRelationsRepository,
  ) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<void> {
    const data = validate(updateStudentStatusSchema, body);

    const student = await this.studentsRepository.findById(id, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    await this.studentsRepository.updateStatus(id, tenantId, data.status);

    // When archiving, also update the coach-student relation
    if (data.status === "archived") {
      const relation = await this.coachStudentRelationsRepository.findByStudentIdAndTenantId(
        id,
        tenantId,
      );
      if (relation) {
        await this.coachStudentRelationsRepository.updateStatus(
          relation.id,
          tenantId,
          "archived",
          new Date(),
        );
      }
    }
  }
}
