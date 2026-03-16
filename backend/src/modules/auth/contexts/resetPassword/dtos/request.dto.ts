import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordRequestDTO {
  @ApiProperty({ description: "Reset token received via email" })
  token: string;

  @ApiProperty({ example: "N3wStr0ngP@ss!", minLength: 8, maxLength: 100 })
  password: string;
}
