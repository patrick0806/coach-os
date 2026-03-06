import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";

const TogglePersonalStatusSchema = z.object({
  isActive: z.boolean(),
});

export class TogglePersonalStatusDTO extends createZodDto(TogglePersonalStatusSchema) {
  @ApiProperty({ example: false })
  isActive: boolean;
}
