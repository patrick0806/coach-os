import { ApiProperty } from "@nestjs/swagger";

export class UpdateStudentProgramStatusRequestDTO {
  @ApiProperty({ example: "finished", enum: ["active", "finished", "cancelled"] })
  status: "active" | "finished" | "cancelled";
}
