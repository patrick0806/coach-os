import { ApiProperty } from "@nestjs/swagger";

export class CancelBookingDTO {
  @ApiProperty({ example: "Aluno não compareceu" })
  reason: string;
}
