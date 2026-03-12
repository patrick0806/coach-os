import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CancelTrainingSessionSchema = z.object({
  reason: z.string().max(500).optional(),
  notifyStudent: z.boolean().optional().default(false),
});

export type CancelTrainingSessionInput = z.infer<typeof CancelTrainingSessionSchema>;

export class CancelTrainingSessionDTO {
  @ApiProperty({ required: false, example: "Compromisso de última hora" })
  reason?: string;

  @ApiProperty({ required: false, example: true, description: "Envia email de notificação ao aluno" })
  notifyStudent?: boolean;
}
