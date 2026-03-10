import { ApiProperty } from "@nestjs/swagger";

export class BookingSeriesListItemDTO {
  @ApiProperty({ example: "series-id" })
  id: string;

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
