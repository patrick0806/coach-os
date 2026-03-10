import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { IAccessToken } from "@shared/interfaces";

import { UpdateStudentDTO } from "./dtos/request.dto";
import { UpdateStudentResponseDTO } from "./dtos/response.dto";

@Injectable()
export class UpdateStudentService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
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

    if (dto.servicePlanId !== undefined) {
      const servicePlan = await this.servicePlansRepository.findOwnedById(
        dto.servicePlanId,
        currentUser.personalId,
      );
      if (!servicePlan) {
        throw new NotFoundException("Plano de atendimento não encontrado");
      }
    }

    if (Object.keys(updateData).length > 0) {
      await this.usersRepository.update(student.userId, updateData);
    }

    if (dto.servicePlanId !== undefined && dto.servicePlanId !== student.servicePlanId) {
      await this.studentsRepository.update(id, currentUser.personalId, {
        servicePlanId: dto.servicePlanId,
      });
    }

    const updated = await this.studentsRepository.findById(
      id,
      currentUser.personalId,
    );

    return updated;
  }
}
