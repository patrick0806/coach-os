import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CreateBookingSchema = z.object({
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

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export class CreateBookingDTO implements CreateBookingInput {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  servicePlanId: string;

  @ApiProperty({ example: "2024-01-15" })
  scheduledDate: string;

  @ApiProperty({ example: "08:00" })
  startTime: string;

  @ApiProperty({ example: "09:00" })
  endTime: string;

  @ApiProperty({ required: false, example: "Preciso trabalhar mobilidade" })
  notes?: string;
}
