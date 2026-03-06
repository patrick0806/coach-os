import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

export const ReorderPlansSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        order: z.number().int().min(0),
      }),
    )
    .min(1),
});

export type ReorderPlansInput = z.infer<typeof ReorderPlansSchema>;

export class ReorderPlansDTO implements ReorderPlansInput {
  @ApiProperty({
    example: [
      { id: "uuid-plan-1", order: 2 },
      { id: "uuid-plan-2", order: 0 },
    ],
  })
  items: { id: string; order: number }[];
}
