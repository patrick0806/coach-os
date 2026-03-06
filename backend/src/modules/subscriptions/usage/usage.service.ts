import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { IAccessToken } from "@shared/interfaces";

import { UsageDTO } from "./dtos/response.dto";

@Injectable()
export class UsageService {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(currentUser: IAccessToken): Promise<UsageDTO> {
    const personal = await this.personalsRepository.findById(currentUser.personalId as string);
    if (!personal) {
      throw new NotFoundException("Personal não encontrado");
    }

    const studentsUsed = await this.studentsRepository.countActiveByPersonal(personal.id);

    if (!personal.subscriptionPlanId) {
      return { studentsUsed, studentsLimit: null, planId: null, planName: null };
    }

    const plan = await this.plansRepository.findById(personal.subscriptionPlanId);

    return {
      studentsUsed,
      studentsLimit: plan?.maxStudents ?? null,
      planId: plan?.id ?? null,
      planName: plan?.name ?? null,
    };
  }
}
