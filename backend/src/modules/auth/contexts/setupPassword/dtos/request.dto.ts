import { ApiProperty } from "@nestjs/swagger";

export class SetupPasswordRequestDTO {
  @ApiProperty({ description: "Setup token received via invite email" })
  token: string;

  @ApiProperty({ example: "Str0ngP@ss!", minLength: 8, maxLength: 100 })
  password: string;
}
