import { Injectable, NotFoundException } from "@nestjs/common";

import { ProgressCheckinsRepository } from "@shared/repositories/progressCheckins.repository";

@Injectable()
export class DeleteCheckinUseCase {
  constructor(
    private readonly progressCheckinsRepository: ProgressCheckinsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const deleted = await this.progressCheckinsRepository.delete(id, tenantId);
    if (!deleted) {
      throw new NotFoundException("Checkin not found");
    }
  }
}
