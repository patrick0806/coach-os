import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CheckoutSchema = z.object({
  planId: z.string().uuid("planId deve ser um UUID válido"),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

export class CheckoutDTO implements CheckoutInput {
  @ApiProperty({ example: "uuid-do-plano", description: "ID do plano SaaS a ser assinado" })
  planId: string;
}
