import { Injectable, ConflictException } from "@nestjs/common";
import { z } from "zod";

import {
  WorkingHoursRepository,
  WorkingHours,
} from "@shared/repositories/workingHours.repository";
import { validate } from "@shared/utils/validation.util";

const createWorkingHoursSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
    effectiveFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime must be before endTime",
    path: ["startTime"],
  });

@Injectable()
export class CreateWorkingHoursUseCase {
  constructor(
    private readonly workingHoursRepository: WorkingHoursRepository,
  ) {}

  async execute(
    body: unknown,
    tenantId: string,
  ): Promise<WorkingHours> {
    const data = validate(createWorkingHoursSchema, body);

    const existing = await this.workingHoursRepository.findByDayOfWeek(
      tenantId,
      data.dayOfWeek,
    );

    const hasOverlap = existing.some(
      (rule) => data.startTime < rule.endTime! && data.endTime > rule.startTime!,
    );

    if (hasOverlap) {
      throw new ConflictException(
        "Working hours overlap with an existing entry on this day",
      );
    }

    return this.workingHoursRepository.create({
      tenantId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      effectiveFrom: data.effectiveFrom,
    });
  }
}
