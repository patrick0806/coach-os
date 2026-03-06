import { Injectable, NotFoundException } from "@nestjs/common";

import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class DeactivateServicePlanService {
  constructor(private readonly servicePlansRepository: ServicePlansRepository) {}

  async execute(id: string, currentUser: IAccessToken): Promise<void> {
    const plan = await this.servicePlansRepository.findOwnedById(
      id,
      currentUser.personalId as string,
    );
    if (!plan) {
      throw new NotFoundException("Plano de serviço não encontrado");
    }

    await this.servicePlansRepository.deactivate(id, currentUser.personalId as string);
  }
}
