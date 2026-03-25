import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { format } from "date-fns";

import {
  RecurringSlotsRepository,
  RecurringSlot,
} from "@shared/repositories/recurringSlots.repository";
import { validate } from "@shared/utils/validation.util";

const updateRecurringSlotSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Must be HH:MM format")
      .optional(),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Must be HH:MM format")
      .optional(),
    location: z.string().max(300).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }
      return true;
    },
    { message: "startTime must be before endTime", path: ["startTime"] },
  );

@Injectable()
export class UpdateRecurringSlotUseCase {
  constructor(
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
  ) {}

  async execute(
    id: string,
    body: unknown,
    tenantId: string,
  ): Promise<RecurringSlot> {
    const data = validate(updateRecurringSlotSchema, body);

    const existing = await this.recurringSlotsRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Recurring slot not found");
    }

    const today = format(new Date(), "yyyy-MM-dd");

    // Close the old record by setting effectiveTo = today
    await this.recurringSlotsRepository.update(id, tenantId, {
      effectiveTo: today,
      isActive: false,
    });

    // Create new versioned record with effectiveFrom = today + new values
    const newSlot = await this.recurringSlotsRepository.create({
      tenantId: existing.tenantId,
      studentId: existing.studentId ?? undefined,
      studentProgramId: existing.studentProgramId ?? undefined,
      type: existing.type as "booking" | "block",
      dayOfWeek: data.dayOfWeek !== undefined ? data.dayOfWeek : existing.dayOfWeek,
      startTime: data.startTime !== undefined ? data.startTime : existing.startTime,
      endTime: data.endTime !== undefined ? data.endTime : existing.endTime,
      effectiveFrom: today,
      location: data.location !== undefined ? (data.location ?? undefined) : (existing.location ?? undefined),
    });

    return newSlot;
  }
}
