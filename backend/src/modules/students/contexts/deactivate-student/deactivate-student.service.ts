import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class DeactivateStudentService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(id: string, currentUser: IAccessToken): Promise<void> {
    const student = await this.studentsRepository.findById(
      id,
      currentUser.personalId,
    );

    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    await this.usersRepository.update(student.userId, { isActive: false });
  }
}
