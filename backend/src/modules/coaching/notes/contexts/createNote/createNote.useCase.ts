import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { StudentNotesRepository, StudentNote } from "@shared/repositories/studentNotes.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { validate } from "@shared/utils/validation.util";

const createNoteSchema = z.object({
  note: z.string().min(1).max(5000),
});

@Injectable()
export class CreateNoteUseCase {
  constructor(
    private readonly studentNotesRepository: StudentNotesRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(studentId: string, body: unknown, tenantId: string): Promise<StudentNote> {
    const data = validate(createNoteSchema, body);

    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.studentNotesRepository.create({
      tenantId,
      studentId,
      note: data.note,
    });
  }
}
