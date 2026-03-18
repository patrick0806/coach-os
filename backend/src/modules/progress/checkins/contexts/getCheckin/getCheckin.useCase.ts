import { Injectable, NotFoundException } from "@nestjs/common";

import { ProgressCheckinsRepository, ProgressCheckinWithData } from "@shared/repositories/progressCheckins.repository";

@Injectable()
export class GetCheckinUseCase {
  constructor(
    private readonly progressCheckinsRepository: ProgressCheckinsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<ProgressCheckinWithData> {
    const checkin = await this.progressCheckinsRepository.findById(id, tenantId);
    if (!checkin) {
      throw new NotFoundException("Checkin not found");
    }

    return checkin;
  }
}
