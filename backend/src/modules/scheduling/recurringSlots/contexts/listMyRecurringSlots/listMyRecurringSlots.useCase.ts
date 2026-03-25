import { Injectable } from "@nestjs/common";

import {
  RecurringSlotsRepository,
  RecurringSlot,
} from "@shared/repositories/recurringSlots.repository";

@Injectable()
export class ListMyRecurringSlotsUseCase {
  constructor(
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
  ) {}

  async execute(
    studentId: string,
    tenantId: string,
  ): Promise<RecurringSlot[]> {
    return this.recurringSlotsRepository.findByStudentId(
      studentId,
      tenantId,
      true,
    );
  }
}
