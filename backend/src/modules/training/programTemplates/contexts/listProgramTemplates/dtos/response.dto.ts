import { ApiProperty } from "@nestjs/swagger";

export class ProgramTemplateItemDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ example: "active", enum: ["active", "archived"] })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ListProgramTemplatesResponseDTO {
  @ApiProperty({ type: [ProgramTemplateItemDTO] })
  content: ProgramTemplateItemDTO[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  size: number;

  @ApiProperty()
  totalElements: number;

  @ApiProperty()
  totalPages: number;
}
