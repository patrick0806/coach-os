import { ApiProperty } from "@nestjs/swagger";

export class UpdateRelationStatusRequestDTO {
  @ApiProperty({ enum: ["active", "paused", "archived"] })
  status: "active" | "paused" | "archived";
}
