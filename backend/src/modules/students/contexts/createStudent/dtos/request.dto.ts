import { ApiProperty } from "@nestjs/swagger";

export class CreateStudentRequestDTO {
  @ApiProperty({ example: "Maria Silva", minLength: 3, maxLength: 150 })
  name: string;

  @ApiProperty({ example: "maria@email.com", format: "email" })
  email: string;

  @ApiProperty({ example: "+55 11 99999-9999", required: false })
  phoneNumber?: string;

  @ApiProperty({ example: "Perder peso e ganhar músculo", required: false, maxLength: 300 })
  goal?: string;

  @ApiProperty({ example: "Aluna dedicada, faz academia há 2 anos.", required: false })
  observations?: string;

  @ApiProperty({ example: "Dor lombar crônica", required: false })
  physicalRestrictions?: string;
}
