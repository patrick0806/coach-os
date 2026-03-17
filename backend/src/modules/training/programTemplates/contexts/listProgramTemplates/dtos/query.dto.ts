import { ApiProperty } from "@nestjs/swagger";

export class ListProgramTemplatesQueryDTO {
  @ApiProperty({ example: 0, required: false, default: 0 })
  page?: number;

  @ApiProperty({ example: 10, required: false, default: 10 })
  size?: number;

  @ApiProperty({ example: "hipertrofia", required: false })
  search?: string;

  @ApiProperty({ example: "active", required: false, enum: ["active", "archived"] })
  status?: string;
}
