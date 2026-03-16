import { ApiProperty } from "@nestjs/swagger";

export class ListPlansResponseDTO {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() price: string;
  @ApiProperty() maxStudents: number;
  @ApiProperty({ type: [String], nullable: true }) benefits: string[] | null;
  @ApiProperty() highlighted: boolean;
  @ApiProperty() order: number;
}
