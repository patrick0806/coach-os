import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordResponseDTO {
  @ApiProperty({ example: "Password reset successfully" })
  message: string;
}
