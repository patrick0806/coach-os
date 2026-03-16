import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentNote, StudentNotesRepository } from "@shared/repositories/studentNotes.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

@Injectable()
export class ListNotesUseCase {
  constructor(
    private readonly studentNotesRepository: StudentNotesRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(studentId: string, tenantId: string): Promise<StudentNote[]> {
    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.studentNotesRepository.findByStudentId(studentId, tenantId);
  }
}
