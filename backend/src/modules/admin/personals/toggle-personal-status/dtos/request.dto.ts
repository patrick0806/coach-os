import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

export const TogglePersonalStatusSchema = z.object({
  isActive: z.boolean(),
});

export type TogglePersonalStatusInput = z.infer<typeof TogglePersonalStatusSchema>;

export class TogglePersonalStatusDTO implements TogglePersonalStatusInput {
  @ApiProperty({ example: false })
  isActive: boolean;
}
