import { Injectable } from "@nestjs/common";
import { z } from "zod";

import {
  WorkingHoursRepository,
  WorkingHours,
} from "@shared/repositories/workingHours.repository";
import { validate } from "@shared/utils/validation.util";

const workingHoursItemSchema = z
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

const bulkCreateSchema = z.object({
  items: z.array(workingHoursItemSchema).min(1, "At least one item is required"),
});

export interface BulkCreateResult {
  created: WorkingHours[];
  errors: { index: number; message: string }[];
}

@Injectable()
export class BulkCreateWorkingHoursUseCase {
  constructor(
    private readonly workingHoursRepository: WorkingHoursRepository,
  ) {}

  async execute(body: unknown, tenantId: string): Promise<BulkCreateResult> {
    const { items } = validate(bulkCreateSchema, body);

    const existing = await this.workingHoursRepository.findActiveByTenant(tenantId);

    const toCreate: {
      tenantId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      effectiveFrom: string;
    }[] = [];
    const errors: { index: number; message: string }[] = [];

    // Track accepted items for intra-batch overlap detection
    const accepted: { dayOfWeek: number; startTime: string; endTime: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Check overlap with existing DB entries
      const existingOverlap = existing.some(
        (wh) =>
          wh.dayOfWeek === item.dayOfWeek &&
          item.startTime < wh.endTime! &&
          item.endTime > wh.startTime!,
      );

      if (existingOverlap) {
        errors.push({ index: i, message: "Overlaps with existing working hours" });
        continue;
      }

      // Check overlap with other items in the same batch
      const batchOverlap = accepted.some(
        (a) =>
          a.dayOfWeek === item.dayOfWeek &&
          item.startTime < a.endTime &&
          item.endTime > a.startTime,
      );

      if (batchOverlap) {
        errors.push({ index: i, message: "Overlaps with another item in this batch" });
        continue;
      }

      accepted.push({
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
      });

      toCreate.push({
        tenantId,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        effectiveFrom: item.effectiveFrom,
      });
    }

    if (toCreate.length === 0) {
      return { created: [], errors };
    }

    const created = await this.workingHoursRepository.createMany(toCreate);

    return { created, errors };
  }
}
