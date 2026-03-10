import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const BulkAvailabilitySchema = z
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
    slotDurationMinutes: z
      .number()
      .int()
      .min(15, "slotDurationMinutes deve ser no minimo 15")
      .max(240, "slotDurationMinutes deve ser no maximo 240"),
    breakStart: z.string().regex(TIME_REGEX, "breakStart deve estar no formato HH:mm").optional(),
    breakEnd: z.string().regex(TIME_REGEX, "breakEnd deve estar no formato HH:mm").optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Horario de termino deve ser apos o inicio",
    path: ["endTime"],
  })
  .refine((data) => {
    const hasBreakStart = Boolean(data.breakStart);
    const hasBreakEnd = Boolean(data.breakEnd);
    return hasBreakStart === hasBreakEnd;
  }, {
    message: "Informe inicio e fim da pausa",
    path: ["breakStart"],
  })
  .refine((data) => {
    if (!data.breakStart || !data.breakEnd) {
      return true;
    }

    return (
      data.breakStart >= data.startTime &&
      data.breakEnd <= data.endTime &&
      data.breakStart < data.breakEnd
    );
  }, {
    message: "Pausa invalida: deve estar dentro do horario de trabalho",
    path: ["breakStart"],
  });

export type BulkAvailabilityInput = z.infer<typeof BulkAvailabilitySchema>;

export class BulkAvailabilityDTO implements BulkAvailabilityInput {
  @ApiProperty({ example: 1, description: "0=Sunday, 1=Monday, ..., 6=Saturday" })
  dayOfWeek: number;

  @ApiProperty({ example: "09:00" })
  startTime: string;

  @ApiProperty({ example: "18:00" })
  endTime: string;

  @ApiProperty({ example: 60, description: "Slot duration in minutes" })
  slotDurationMinutes: number;

  @ApiProperty({ example: "12:00", required: false })
  breakStart?: string;

  @ApiProperty({ example: "13:00", required: false })
  breakEnd?: string;
}
