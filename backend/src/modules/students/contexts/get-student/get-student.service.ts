import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { IAccessToken } from "@shared/interfaces";

import { GetStudentResponseDTO } from "./dtos/response.dto";

@Injectable()
export class GetStudentService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async execute(
    id: string,
    currentUser: IAccessToken,
  ): Promise<GetStudentResponseDTO> {
    const student = await this.studentsRepository.findById(
      id,
      currentUser.personalId,
    );

    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    return student;
  }
}
