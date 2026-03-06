import { ApiProperty } from "@nestjs/swagger";

export class UpdateBookingStatusDTO {
  @ApiProperty({ enum: ["completed", "no-show"], example: "completed" })
  status: string;
}
