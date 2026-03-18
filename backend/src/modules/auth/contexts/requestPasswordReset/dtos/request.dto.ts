import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RequestPasswordResetRequestDTO {
  @ApiProperty({ example: "joao@email.com", format: "email" })
  email: string;

  @ApiPropertyOptional({ example: "joao-silva", description: "Coach slug — when provided, the reset link points to the branded student page" })
  slug?: string;
}
