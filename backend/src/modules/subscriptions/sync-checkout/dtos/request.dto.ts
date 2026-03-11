import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const SyncCheckoutSchema = z.object({
  sessionId: z.string().min(1, "sessionId é obrigatório"),
});

export type SyncCheckoutInput = z.infer<typeof SyncCheckoutSchema>;

export class SyncCheckoutDTO implements SyncCheckoutInput {
  @ApiProperty({ example: "cs_test_abc123", description: "ID da sessão de checkout do Stripe" })
  sessionId!: string;
}
