import { ApiProperty } from "@nestjs/swagger";

export class UpdateProgramTemplateRequestDTO {
  @ApiProperty({ example: "Hipertrofia Avançada", minLength: 3, maxLength: 200, required: false })
  name?: string;

  @ApiProperty({ example: "Programa atualizado", required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ example: "archived", required: false, enum: ["active", "archived"] })
  status?: string;
}
