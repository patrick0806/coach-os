import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentsRepository, StudentWithUser } from "@shared/repositories/students.repository";

@Injectable()
export class GetStudentUseCase {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async execute(id: string, tenantId: string): Promise<StudentWithUser> {
    const student = await this.studentsRepository.findById(id, tenantId);

    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return student;
  }
}
