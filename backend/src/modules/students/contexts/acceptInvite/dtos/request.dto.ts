import { ApiProperty } from "@nestjs/swagger";

export class AcceptInviteRequestDTO {
  @ApiProperty({ description: "Invitation token from email or shareable link" })
  token: string;

  @ApiProperty({ example: "Maria Silva", minLength: 3, maxLength: 150 })
  name: string;

  @ApiProperty({ example: "Str0ngP@ss!", minLength: 8, maxLength: 100 })
  password: string;
}
