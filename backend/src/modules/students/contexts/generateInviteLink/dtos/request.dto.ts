import { ApiProperty } from "@nestjs/swagger";

export class GenerateInviteLinkRequestDTO {
  @ApiProperty({ example: "Maria Silva", minLength: 3, maxLength: 150 })
  name: string;

  @ApiProperty({ example: "maria@email.com", format: "email" })
  email: string;
}
