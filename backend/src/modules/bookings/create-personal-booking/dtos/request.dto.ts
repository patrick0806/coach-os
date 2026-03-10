import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CreatePersonalBookingSchema = z.object({
  studentId: z.string().uuid("studentId inválido"),
  servicePlanId: z.string().uuid("servicePlanId inválido"),
  scheduledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "scheduledDate deve estar no formato YYYY-MM-DD"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "startTime deve estar no formato HH:mm"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "endTime deve estar no formato HH:mm"),
  notes: z.string().max(500).optional(),
});

export type CreatePersonalBookingInput = z.infer<typeof CreatePersonalBookingSchema>;

export class CreatePersonalBookingDTO implements CreatePersonalBookingInput {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  studentId: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  servicePlanId: string;

  @ApiProperty({ example: "2024-01-15" })
  scheduledDate: string;

  @ApiProperty({ example: "08:00" })
  startTime: string;

  @ApiProperty({ example: "09:00" })
  endTime: string;

  @ApiProperty({ required: false, example: "Sessão de ajuste de mobilidade" })
  notes?: string;
}
