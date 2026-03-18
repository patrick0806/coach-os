import { Injectable } from "@nestjs/common";
import { z } from "zod";

import {
  AvailabilityRulesRepository,
  AvailabilityRule,
} from "@shared/repositories/availabilityRules.repository";
import { validate } from "@shared/utils/validation.util";

const ruleItemSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime must be before endTime",
    path: ["startTime"],
  });

const bulkCreateRulesSchema = z.object({
  rules: z.array(ruleItemSchema).min(1),
});

export interface BulkCreateResult {
  created: AvailabilityRule[];
  conflicts: number;
}

type RuleInput = { dayOfWeek: number; startTime: string; endTime: string };

function hasTimeOverlap(a: RuleInput, b: RuleInput): boolean {
  return a.startTime < b.endTime && a.endTime > b.startTime;
}

@Injectable()
export class BulkCreateAvailabilityRulesUseCase {
  constructor(
    private readonly availabilityRulesRepository: AvailabilityRulesRepository,
  ) {}

  async execute(body: unknown, tenantId: string): Promise<BulkCreateResult> {
    const { rules } = validate(bulkCreateRulesSchema, body);

    // Fetch existing rules for each unique day in one pass
    const uniqueDays = [...new Set(rules.map((r) => r.dayOfWeek))];
    const existingByDay = new Map<number, AvailabilityRule[]>();

    await Promise.all(
      uniqueDays.map(async (day) => {
        const existing = await this.availabilityRulesRepository.findByDayOfWeek(tenantId, day);
        existingByDay.set(day, existing);
      }),
    );

    // Classify each rule — skip conflicts, collect valid ones
    const toCreate: RuleInput[] = [];
    const acceptedByDay = new Map<number, RuleInput[]>();
    let conflicts = 0;

    for (const rule of rules) {
      const existing = existingByDay.get(rule.dayOfWeek) ?? [];
      const accepted = acceptedByDay.get(rule.dayOfWeek) ?? [];

      // Check against DB rules and already-accepted rules in this batch
      const overlapsExisting = existing.some((r) => hasTimeOverlap(rule, r as RuleInput));
      const overlapsAccepted = accepted.some((r) => hasTimeOverlap(rule, r));

      if (overlapsExisting || overlapsAccepted) {
        conflicts++;
      } else {
        toCreate.push(rule);
        acceptedByDay.set(rule.dayOfWeek, [...accepted, rule]);
      }
    }

    const created = await this.availabilityRulesRepository.createMany(
      toCreate.map((r) => ({ tenantId, ...r })),
    );

    return { created, conflicts };
  }
}
