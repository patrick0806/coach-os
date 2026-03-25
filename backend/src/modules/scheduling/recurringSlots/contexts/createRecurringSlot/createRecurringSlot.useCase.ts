import { Injectable } from "@nestjs/common";
import { z } from "zod";

import {
  RecurringSlotsRepository,
  RecurringSlot,
} from "@shared/repositories/recurringSlots.repository";
import { validate } from "@shared/utils/validation.util";

const createRecurringSlotSchema = z
  .object({
    type: z.enum(["booking", "block"]),
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
    effectiveFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
    studentId: z.string().min(1).optional(),
    location: z.string().max(300).optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime must be before endTime",
    path: ["startTime"],
  })
  .refine(
    (data) => {
      if (data.type === "booking" && !data.studentId) {
        return false;
      }
      return true;
    },
    {
      message: "studentId is required when type is booking",
      path: ["studentId"],
    },
  );

@Injectable()
export class CreateRecurringSlotUseCase {
  constructor(
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
  ) {}

  async execute(body: unknown, tenantId: string): Promise<RecurringSlot> {
    const data = validate(createRecurringSlotSchema, body);

    return this.recurringSlotsRepository.create({
      tenantId,
      type: data.type,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      effectiveFrom: data.effectiveFrom,
      studentId: data.studentId,
      location: data.location,
    });
  }
}
