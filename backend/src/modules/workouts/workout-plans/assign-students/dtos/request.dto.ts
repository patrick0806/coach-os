import { ApiProperty } from "@nestjs/swagger";

export class AssignStudentsDTO {
  @ApiProperty({ type: [String], example: ["student-id-1", "student-id-2"] })
  studentIds: string[];
}
