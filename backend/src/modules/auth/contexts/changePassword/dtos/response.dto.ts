import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordResponseDTO {
  @ApiProperty({ example: "Password changed successfully" })
  message: string;
}
