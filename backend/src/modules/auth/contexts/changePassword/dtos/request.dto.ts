import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordRequestDTO {
  @ApiProperty({ description: "Current password for verification" })
  currentPassword: string;

  @ApiProperty({ example: "N3wStr0ngP@ss!", minLength: 8, maxLength: 100 })
  newPassword: string;
}
