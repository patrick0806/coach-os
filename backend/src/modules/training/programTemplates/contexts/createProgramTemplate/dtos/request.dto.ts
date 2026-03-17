import { ApiProperty } from "@nestjs/swagger";

export class CreateProgramTemplateRequestDTO {
  @ApiProperty({ example: "Hipertrofia - 3x por semana", minLength: 3, maxLength: 200 })
  name: string;

  @ApiProperty({ example: "Programa focado em ganho de massa muscular", required: false })
  description?: string;
}
