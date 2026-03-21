import { ApiProperty } from "@nestjs/swagger";

export class AdminResponseDTO {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty({ nullable: true }) createdAt: Date | null;
}
