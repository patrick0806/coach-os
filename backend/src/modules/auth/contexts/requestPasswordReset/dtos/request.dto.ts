import { ApiProperty } from "@nestjs/swagger";

export class RequestPasswordResetRequestDTO {
  @ApiProperty({ example: "joao@email.com", format: "email" })
  email: string;
}
