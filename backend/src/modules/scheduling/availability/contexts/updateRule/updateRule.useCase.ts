import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { z } from "zod";

import {
  AvailabilityRulesRepository,
  AvailabilityRule,
} from "@shared/repositories/availabilityRules.repository";
import { validate } from "@shared/utils/validation.util";

const updateRuleSchema = z
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
export class UpdateAvailabilityRuleUseCase {
  constructor(
    private readonly availabilityRulesRepository: AvailabilityRulesRepository,
  ) {}

  async execute(
    id: string,
    body: unknown,
    tenantId: string,
  ): Promise<AvailabilityRule> {
    const data = validate(updateRuleSchema, body);

    const existing = await this.availabilityRulesRepository.findById(
      id,
      tenantId,
    );
    if (!existing) {
      throw new NotFoundException("Availability rule not found");
    }

    const finalDayOfWeek = data.dayOfWeek ?? existing.dayOfWeek;
    const finalStartTime = data.startTime ?? existing.startTime;
    const finalEndTime = data.endTime ?? existing.endTime;

    if (finalStartTime >= finalEndTime) {
      throw new ConflictException("startTime must be before endTime");
    }

    const rulesOnDay = await this.availabilityRulesRepository.findByDayOfWeek(
      tenantId,
      finalDayOfWeek,
    );

    const hasOverlap = rulesOnDay.some(
      (rule) =>
        rule.id !== id &&
        finalStartTime < rule.endTime! &&
        finalEndTime > rule.startTime!,
    );

    if (hasOverlap) {
      throw new ConflictException(
        "Availability rule overlaps with an existing rule on this day",
      );
    }

    const updateData: Partial<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }> = {};

    if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;

    const updated = await this.availabilityRulesRepository.update(
      id,
      tenantId,
      updateData,
    );

    return updated!;
  }
}
