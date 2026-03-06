import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

const TIME_REGEX = /^\d{2}:\d{2}$/;

export const UpdateAvailabilitySchema = z.object({
  startTime: z.string().regex(TIME_REGEX, "startTime deve estar no formato HH:mm").optional(),
  endTime: z.string().regex(TIME_REGEX, "endTime deve estar no formato HH:mm").optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>;

export class UpdateAvailabilityDTO implements UpdateAvailabilityInput {
  @ApiProperty({ required: false, example: "09:00" })
  startTime?: string;

  @ApiProperty({ required: false, example: "10:00" })
  endTime?: string;

  @ApiProperty({ required: false, example: false })
  isActive?: boolean;
}
