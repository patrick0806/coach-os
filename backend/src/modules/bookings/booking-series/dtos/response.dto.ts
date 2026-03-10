import { ApiProperty } from "@nestjs/swagger";

import { BookingDTO } from "../../shared/dtos/booking.dto";

export class BookingSeriesDTO {
  @ApiProperty({ example: "series-id" })
  id: string;

  @ApiProperty({ example: "personal-id" })
  personalId: string;

  @ApiProperty({ example: "student-id" })
  studentId: string;

  @ApiProperty({ example: "service-plan-id" })
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

  @ApiProperty({ required: false, nullable: true })
  notes: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class CreateBookingSeriesResponseDTO {
  @ApiProperty({ type: BookingSeriesDTO })
  series: BookingSeriesDTO;

  @ApiProperty({ example: 12 })
  bookingsCreated: number;

  @ApiProperty({ type: [BookingDTO] })
  bookings: BookingDTO[];
}
