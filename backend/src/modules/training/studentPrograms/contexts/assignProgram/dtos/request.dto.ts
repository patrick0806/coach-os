import { ApiProperty } from "@nestjs/swagger";

export class AssignProgramRequestDTO {
  @ApiProperty({ example: "template-id-1", required: false })
  programTemplateId?: string;

  @ApiProperty({ example: "Programa de Força A", minLength: 3, maxLength: 200 })
  name: string;
}
