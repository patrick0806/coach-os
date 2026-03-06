import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";

const TogglePlanStatusSchema = z.object({
  isActive: z.boolean(),
});

export class TogglePlanStatusDTO extends createZodDto(TogglePlanStatusSchema) {
  @ApiProperty({ example: false })
  isActive: boolean;
}
