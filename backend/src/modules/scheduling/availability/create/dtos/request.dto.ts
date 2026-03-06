import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

const TIME_REGEX = /^\d{2}:\d{2}$/;

export const CreateAvailabilitySchema = z
  .object({
    dayOfWeek: z
      .number()
      .int()
      .min(0, "dayOfWeek deve ser entre 0 e 6")
      .max(6, "dayOfWeek deve ser entre 0 e 6"),
    startTime: z
      .string()
      .regex(TIME_REGEX, "startTime deve estar no formato HH:mm"),
    endTime: z
      .string()
      .regex(TIME_REGEX, "endTime deve estar no formato HH:mm"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime deve ser anterior a endTime",
    path: ["startTime"],
  });

export type CreateAvailabilityInput = z.infer<typeof CreateAvailabilitySchema>;

export class CreateAvailabilityDTO implements CreateAvailabilityInput {
  @ApiProperty({ example: 1, description: "0=Sunday, 1=Monday, ..., 6=Saturday" })
  dayOfWeek: number;

  @ApiProperty({ example: "08:00" })
  startTime: string;

  @ApiProperty({ example: "09:00" })
  endTime: string;
}
