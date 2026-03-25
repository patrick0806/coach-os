import { Injectable, NotFoundException } from "@nestjs/common";
import { format } from "date-fns";

import { WorkingHoursRepository } from "@shared/repositories/workingHours.repository";

@Injectable()
export class DeleteWorkingHoursUseCase {
  constructor(
    private readonly workingHoursRepository: WorkingHoursRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.workingHoursRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Working hours not found");
    }

    const today = format(new Date(), "yyyy-MM-dd");

    await this.workingHoursRepository.update(id, tenantId, {
      effectiveTo: today,
      isActive: false,
    });
  }
}
