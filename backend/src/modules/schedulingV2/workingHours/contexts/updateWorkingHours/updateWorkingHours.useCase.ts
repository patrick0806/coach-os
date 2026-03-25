import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { format } from "date-fns";

import {
  WorkingHoursRepository,
  WorkingHours,
} from "@shared/repositories/workingHours.repository";
import { validate } from "@shared/utils/validation.util";

const updateWorkingHoursSchema = z
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
export class UpdateWorkingHoursUseCase {
  constructor(
    private readonly workingHoursRepository: WorkingHoursRepository,
  ) {}

  async execute(
    id: string,
    body: unknown,
    tenantId: string,
  ): Promise<WorkingHours> {
    const data = validate(updateWorkingHoursSchema, body);

    const existing = await this.workingHoursRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Working hours not found");
    }

    const today = format(new Date(), "yyyy-MM-dd");

    // Close the old record by setting effectiveTo = today
    await this.workingHoursRepository.update(id, tenantId, {
      effectiveTo: today,
    });

    // Create a new versioned record with effectiveFrom = today
    const newRecord = await this.workingHoursRepository.create({
      tenantId,
      dayOfWeek: data.dayOfWeek ?? existing.dayOfWeek,
      startTime: data.startTime ?? existing.startTime,
      endTime: data.endTime ?? existing.endTime,
      effectiveFrom: today,
    });

    return newRecord;
  }
}
