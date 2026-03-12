import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

const DayRuleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  sessionType: z.enum(["presential", "online", "rest"]),
  workoutPlanId: z.string().uuid().nullable().optional(),
  scheduledTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "scheduledTime deve estar no formato HH:mm")
    .nullable()
    .optional(),
});

export const UpsertScheduleRulesSchema = z.object({
  days: z.array(DayRuleSchema).min(1).max(7),
});

export type UpsertScheduleRulesInput = z.infer<typeof UpsertScheduleRulesSchema>;

class DayRuleDTO {
  @ApiProperty({ example: 1, description: "0=Domingo, 1=Segunda...6=Sábado" })
  dayOfWeek: number;

  @ApiProperty({ enum: ["presential", "online", "rest"] })
  sessionType: "presential" | "online" | "rest";

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000", nullable: true, required: false })
  workoutPlanId?: string | null;

  @ApiProperty({ example: "07:00", nullable: true, required: false })
  scheduledTime?: string | null;
}

export class UpsertScheduleRulesDTO implements UpsertScheduleRulesInput {
  @ApiProperty({ type: [DayRuleDTO] })
  days: DayRuleDTO[];
}
