import { ApiProperty } from "@nestjs/swagger";

export class UpdateStudentRequestDTO {
  @ApiProperty({ example: "+55 11 99999-9999", required: false, nullable: true })
  phoneNumber?: string | null;

  @ApiProperty({ example: "Ganhar massa muscular", required: false, nullable: true, maxLength: 300 })
  goal?: string | null;

  @ApiProperty({ example: "Treina há 3 anos", required: false, nullable: true })
  observations?: string | null;

  @ApiProperty({ example: "Hérnia de disco", required: false, nullable: true })
  physicalRestrictions?: string | null;
}
