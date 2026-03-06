import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { IAccessToken } from "@shared/interfaces";

import { UpdateStudentDTO } from "./dtos/request.dto";
import { UpdateStudentResponseDTO } from "./dtos/response.dto";

@Injectable()
export class UpdateStudentService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateStudentDTO,
    currentUser: IAccessToken,
  ): Promise<UpdateStudentResponseDTO> {
    const student = await this.studentsRepository.findById(
      id,
      currentUser.personalId,
    );

    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    const updateData: { name?: string; email?: string } = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;

    await this.usersRepository.update(student.userId, updateData);

    const updated = await this.studentsRepository.findById(
      id,
      currentUser.personalId,
    );

    return updated;
  }
}
