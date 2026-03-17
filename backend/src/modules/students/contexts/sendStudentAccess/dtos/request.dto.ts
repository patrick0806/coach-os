import { ApiProperty } from "@nestjs/swagger";

export class SendStudentAccessRequestDTO {
  @ApiProperty({ enum: ["email", "link"], example: "email" })
  mode: "email" | "link";
}
