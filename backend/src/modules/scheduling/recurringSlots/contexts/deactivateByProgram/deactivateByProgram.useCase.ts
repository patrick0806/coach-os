import { Injectable } from "@nestjs/common";

import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";

@Injectable()
export class DeactivateByProgramUseCase {
  constructor(
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
  ) {}

  async execute(programId: string, tenantId: string): Promise<number> {
    return this.recurringSlotsRepository.deactivateByProgramId(
      programId,
      tenantId,
    );
  }
}
