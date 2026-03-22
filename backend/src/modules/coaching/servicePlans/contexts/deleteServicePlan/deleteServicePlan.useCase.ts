import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { ServicePlansRepository } from "@shared/repositories/servicePlans.repository";
import { CoachingContractsRepository } from "@shared/repositories/coachingContracts.repository";

@Injectable()
export class DeleteServicePlanUseCase {
  constructor(
    private readonly servicePlansRepository: ServicePlansRepository,
    private readonly contractsRepository: CoachingContractsRepository,
  ) { }

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.servicePlansRepository.findById(id, tenantId);

    if (!existing) {
      throw new NotFoundException("Serviço não encontrado");
    }

    const activeContracts = await this.contractsRepository.countActiveByServicePlanId(id, tenantId);
    if (activeContracts > 0) {
      throw new BadRequestException("Este serviço ainda possui alunos ativos");
    }

    await this.servicePlansRepository.delete(id, tenantId);
  }
}
