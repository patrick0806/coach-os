import { ApiProperty } from "@nestjs/swagger";

export class AvailableSlotDTO {
  @ApiProperty({ example: "slot-id" })
  id: string;

  @ApiProperty({ example: "08:00" })
  startTime: string;

  @ApiProperty({ example: "09:00" })
  endTime: string;

  @ApiProperty({ example: 1 })
  dayOfWeek: number;
}

export class BookingDTO {
  @ApiProperty({ example: "booking-id" })
  id: string;

  @ApiProperty({ example: "personal-id" })
  personalId: string;

  @ApiProperty({ example: "student-id" })
  studentId: string;

  @ApiProperty({ example: "plan-id" })
  servicePlanId: string;

  @ApiProperty({ example: "Aluno Teste" })
  studentName: string;

  @ApiProperty({ example: "aluno@teste.com" })
  studentEmail: string;

  @ApiProperty({ example: "Plano Básico" })
  servicePlanName: string;

  @ApiProperty({ required: false, nullable: true, example: "series-id" })
  seriesId: string | null;

  @ApiProperty({ required: false, example: false })
  isRecurring?: boolean;

  @ApiProperty()
  scheduledDate: Date;

  @ApiProperty({ example: "08:00" })
  startTime: string;

  @ApiProperty({ example: "09:00" })
  endTime: string;

  @ApiProperty({ required: false, nullable: true })
  notes: string | null;

  @ApiProperty({ example: "scheduled" })
  status: string;

  @ApiProperty({ required: false, nullable: true })
  cancelledAt: Date | null;

  @ApiProperty({ required: false, nullable: true })
  cancellationReason: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedBookingsDTO {
  @ApiProperty({ type: [BookingDTO] })
  content: BookingDTO[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  size: number;

  @ApiProperty({ example: 1 })
  totalElements: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
