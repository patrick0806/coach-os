import { Injectable } from "@nestjs/common";

import {
  RecurringSlotsRepository,
  RecurringSlot,
} from "@shared/repositories/recurringSlots.repository";

@Injectable()
export class ListRecurringSlotsUseCase {
  constructor(
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
  ) {}

  async execute(
    tenantId: string,
    studentId?: string,
  ): Promise<RecurringSlot[]> {
    if (studentId) {
      return this.recurringSlotsRepository.findByStudentId(
        studentId,
        tenantId,
        true,
      );
    }

    return this.recurringSlotsRepository.findByTenantId(tenantId, true);
  }
}
