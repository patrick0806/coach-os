import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CopyAvailabilitySchema = z
  .object({
    sourceDayOfWeek: z
      .number()
      .int()
      .min(0, "sourceDayOfWeek deve ser entre 0 e 6")
      .max(6, "sourceDayOfWeek deve ser entre 0 e 6"),
    targetDays: z.array(
      z
        .number()
        .int()
        .min(0, "targetDays deve conter dias entre 0 e 6")
        .max(6, "targetDays deve conter dias entre 0 e 6"),
    )
      .min(1, "Informe ao menos um dia de destino"),
  })
  .refine((data) => !data.targetDays.includes(data.sourceDayOfWeek), {
    message: "Dia de origem nao pode estar nos dias de destino",
    path: ["targetDays"],
  });

export type CopyAvailabilityInput = z.infer<typeof CopyAvailabilitySchema>;

export class CopyAvailabilityDTO implements CopyAvailabilityInput {
  @ApiProperty({ example: 1, description: "0=Sunday, 1=Monday, ..., 6=Saturday" })
  sourceDayOfWeek: number;

  @ApiProperty({ example: [2, 4, 5], type: [Number] })
  targetDays: number[];
}
