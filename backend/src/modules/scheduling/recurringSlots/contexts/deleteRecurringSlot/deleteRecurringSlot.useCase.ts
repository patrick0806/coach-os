import { Injectable, NotFoundException } from "@nestjs/common";
import { format } from "date-fns";

import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";

@Injectable()
export class DeleteRecurringSlotUseCase {
  constructor(
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.recurringSlotsRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Recurring slot not found");
    }

    const today = format(new Date(), "yyyy-MM-dd");

    await this.recurringSlotsRepository.update(id, tenantId, {
      effectiveTo: today,
      isActive: false,
    });
  }
}
