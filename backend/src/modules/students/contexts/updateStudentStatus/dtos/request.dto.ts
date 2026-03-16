import { ApiProperty } from "@nestjs/swagger";

export class UpdateStudentStatusRequestDTO {
  @ApiProperty({ enum: ["active", "paused", "archived"] })
  status: "active" | "paused" | "archived";
}
