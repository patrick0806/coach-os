import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { StudentsRepository, StudentWithUser } from "@shared/repositories/students.repository";
import { validate } from "@shared/utils/validation.util";

const updateStudentSchema = z.object({
  phoneNumber: z.string().max(20).nullable().optional(),
  goal: z.string().max(300).nullable().optional(),
  observations: z.string().nullable().optional(),
  physicalRestrictions: z.string().nullable().optional(),
});

@Injectable()
export class UpdateStudentUseCase {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<StudentWithUser> {
    const data = validate(updateStudentSchema, body);

    const student = await this.studentsRepository.findById(id, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    await this.studentsRepository.update(id, tenantId, data);

    const updated = await this.studentsRepository.findById(id, tenantId);
    return updated!;
  }
}
