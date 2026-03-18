import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { CoachingContractsRepository, ContractWithPlan } from "@shared/repositories/coachingContracts.repository";

@Injectable()
export class CancelContractUseCase {
  constructor(private readonly contractsRepository: CoachingContractsRepository) {}

  async execute(id: string, tenantId: string): Promise<ContractWithPlan> {
    const contract = await this.contractsRepository.findById(id, tenantId);
    if (!contract) {
      throw new NotFoundException("Contract not found");
    }

    if (contract.status !== "active") {
      throw new BadRequestException("Contract is already cancelled or expired");
    }

    await this.contractsRepository.update(id, tenantId, {
      status: "cancelled",
      endDate: new Date(),
    });

    const updated = await this.contractsRepository.findById(id, tenantId);
    return updated!;
  }
}
