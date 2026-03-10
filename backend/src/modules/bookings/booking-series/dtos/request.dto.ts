import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;
const MAX_SERIES_DAYS = 183;

function diffDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export const CreateBookingSeriesSchema = z
  .object({
    studentId: z.string().uuid("studentId inválido"),
    servicePlanId: z.string().uuid("servicePlanId inválido"),
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .min(1, "Informe ao menos um dia da semana")
      .max(7, "daysOfWeek deve ter no máximo 7 itens")
      .refine((days) => new Set(days).size === days.length, {
        message: "daysOfWeek não pode ter dias repetidos",
      }),
    startTime: z
      .string()
      .regex(TIME_REGEX, "startTime deve estar no formato HH:mm"),
    endTime: z
      .string()
      .regex(TIME_REGEX, "endTime deve estar no formato HH:mm"),
    seriesStartDate: z
      .string()
      .regex(ISO_DATE_REGEX, "seriesStartDate deve estar no formato YYYY-MM-DD"),
    seriesEndDate: z
      .string()
      .regex(ISO_DATE_REGEX, "seriesEndDate deve estar no formato YYYY-MM-DD"),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime deve ser anterior a endTime",
    path: ["startTime"],
  })
  .refine((data) => data.seriesStartDate <= data.seriesEndDate, {
    message: "seriesEndDate deve ser igual ou posterior a seriesStartDate",
    path: ["seriesEndDate"],
  })
  .refine((data) => diffDays(data.seriesStartDate, data.seriesEndDate) <= MAX_SERIES_DAYS, {
    message: "Período máximo para recorrência é de 6 meses",
    path: ["seriesEndDate"],
  });

export type CreateBookingSeriesInput = z.infer<typeof CreateBookingSeriesSchema>;

export class CreateBookingSeriesDTO implements CreateBookingSeriesInput {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440001" })
  studentId: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  servicePlanId: string;

  @ApiProperty({ type: [Number], example: [1, 3, 5] })
  daysOfWeek: number[];

  @ApiProperty({ example: "08:00" })
  startTime: string;

  @ApiProperty({ example: "09:00" })
  endTime: string;

  @ApiProperty({ example: "2024-01-01" })
  seriesStartDate: string;

  @ApiProperty({ example: "2024-03-31" })
  seriesEndDate: string;

  @ApiProperty({ required: false, example: "Sessão recorrente de acompanhamento" })
  notes?: string;
}
