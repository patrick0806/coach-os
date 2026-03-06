import { ApiProperty } from "@nestjs/swagger";

export class PlanDTO {
  @ApiProperty({ example: "uuid-here" })
  id: string;

  @ApiProperty({ example: "Pro" })
  name: string;

  @ApiProperty({ example: "O plano perfeito para quem esta voando" })
  description: string;

  @ApiProperty({ example: "29.90" })
  price: string;

  @ApiProperty({ example: true })
  highlighted: boolean;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: ["Ate 10 alunos", "Agenda personalizada", "Planilhas de treinos"], type: [String] })
  benefits: string[];
}
