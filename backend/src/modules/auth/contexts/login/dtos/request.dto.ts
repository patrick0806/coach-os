import { ApiProperty } from "@nestjs/swagger";

export class LoginRequestDTO {
  @ApiProperty({ example: "joao@email.com", format: "email" })
  email: string;

  @ApiProperty({ example: "Str0ngP@ss!" })
  password: string;
}
