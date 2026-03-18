import { ApiProperty } from "@nestjs/swagger";

export class EnumOptionDTO {
  @ApiProperty({ example: "peitoral" })
  value: string;

  @ApiProperty({ example: "Peitoral" })
  label: string;
}
