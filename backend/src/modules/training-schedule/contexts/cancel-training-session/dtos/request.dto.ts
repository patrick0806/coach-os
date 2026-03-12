import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CancelTrainingSessionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type CancelTrainingSessionInput = z.infer<typeof CancelTrainingSessionSchema>;

export class CancelTrainingSessionDTO implements CancelTrainingSessionInput {
  @ApiProperty({ required: false, example: "Compromisso de última hora" })
  reason?: string;
}
