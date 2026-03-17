import { Injectable, ConflictException } from "@nestjs/common";
import { z } from "zod";

import {
  AvailabilityRulesRepository,
  AvailabilityRule,
} from "@shared/repositories/availabilityRules.repository";
import { validate } from "@shared/utils/validation.util";

const createRuleSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime must be before endTime",
    path: ["startTime"],
  });

@Injectable()
export class CreateAvailabilityRuleUseCase {
  constructor(
    private readonly availabilityRulesRepository: AvailabilityRulesRepository,
  ) {}

  async execute(
    body: unknown,
    tenantId: string,
  ): Promise<AvailabilityRule> {
    const data = validate(createRuleSchema, body);

    const existing = await this.availabilityRulesRepository.findByDayOfWeek(
      tenantId,
      data.dayOfWeek,
    );

    const hasOverlap = existing.some(
      (rule) => data.startTime < rule.endTime! && data.endTime > rule.startTime!,
    );

    if (hasOverlap) {
      throw new ConflictException(
        "Availability rule overlaps with an existing rule on this day",
      );
    }

    return this.availabilityRulesRepository.create({
      tenantId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
    });
  }
}
