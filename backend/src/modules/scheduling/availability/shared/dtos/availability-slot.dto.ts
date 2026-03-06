import { ApiProperty } from "@nestjs/swagger";

export class AvailabilitySlotDTO {
  @ApiProperty({ example: "uuid" })
  id: string;

  @ApiProperty({ example: "personal-id" })
  personalId: string;

  @ApiProperty({ example: 1, description: "0=Sunday, 1=Monday, ..., 6=Saturday" })
  dayOfWeek: number;

  @ApiProperty({ example: "08:00" })
  startTime: string;

  @ApiProperty({ example: "09:00" })
  endTime: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
