import { ApiProperty } from "@nestjs/swagger";

export class RequestPasswordResetResponseDTO {
  @ApiProperty({ example: "If the email is registered, a reset link was sent" })
  message: string;
}
