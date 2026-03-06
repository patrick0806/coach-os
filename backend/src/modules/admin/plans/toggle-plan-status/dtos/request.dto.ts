import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

export const TogglePlanStatusSchema = z.object({
  isActive: z.boolean(),
});

export type TogglePlanStatusInput = z.infer<typeof TogglePlanStatusSchema>;

export class TogglePlanStatusDTO implements TogglePlanStatusInput {
  @ApiProperty({ example: false })
  isActive: boolean;
}
