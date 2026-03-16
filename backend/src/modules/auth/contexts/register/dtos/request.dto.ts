import { ApiProperty } from "@nestjs/swagger";

export class RegisterRequestDTO {
  @ApiProperty({ example: "João Silva", minLength: 3, maxLength: 150 })
  name: string;

  @ApiProperty({ example: "joao@email.com", format: "email" })
  email: string;

  @ApiProperty({ example: "Str0ngP@ss!", minLength: 8, maxLength: 100 })
  password: string;

  @ApiProperty({
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    required: false,
    description: "Plan UUID. If omitted, the default plan will be used.",
  })
  planId?: string;
}
