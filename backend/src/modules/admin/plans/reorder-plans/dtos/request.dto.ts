import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";

const ReorderPlansSchema = z.object({
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

export class ReorderPlansDTO extends createZodDto(ReorderPlansSchema) {
  @ApiProperty({
    example: [
      { id: "uuid-plan-1", order: 2 },
      { id: "uuid-plan-2", order: 0 },
    ],
  })
  items: { id: string; order: number }[];
}
