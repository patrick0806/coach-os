import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";

const UpgradeSubscriptionSchema = z.object({
  planId: z.string().uuid("planId deve ser um UUID válido"),
});

export type UpgradeSubscriptionInput = z.infer<typeof UpgradeSubscriptionSchema>;

export class UpgradeSubscriptionDTO extends createZodDto(UpgradeSubscriptionSchema) {
  @ApiProperty({ example: "uuid-do-plano-pro" })
  planId: string;
}
