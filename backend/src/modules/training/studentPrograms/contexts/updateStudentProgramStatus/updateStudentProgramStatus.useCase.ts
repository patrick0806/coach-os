import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  StudentProgramsRepository,
  StudentProgram,
} from "@shared/repositories/studentPrograms.repository";
import { validate } from "@shared/utils/validation.util";

const updateStudentProgramStatusSchema = z.object({
  status: z.enum(["active", "finished", "cancelled"]),
});

@Injectable()
export class UpdateStudentProgramStatusUseCase {
  constructor(
    private readonly studentProgramsRepository: StudentProgramsRepository,
  ) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<StudentProgram> {
    const data = validate(updateStudentProgramStatusSchema, body);

    const program = await this.studentProgramsRepository.findById(id, tenantId);

    if (!program) {
      throw new NotFoundException("Student program not found");
    }

    const updated = await this.studentProgramsRepository.updateStatus(
      id,
      tenantId,
      data.status,
    );

    if (!updated) {
      throw new NotFoundException("Student program not found");
    }

    return updated;
  }
}
