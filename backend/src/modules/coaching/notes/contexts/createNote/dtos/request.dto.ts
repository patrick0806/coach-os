import { ApiProperty } from "@nestjs/swagger";

export class CreateNoteRequestDTO {
  @ApiProperty({ example: "Aluna apresentou dores lombares durante o treino.", minLength: 1, maxLength: 5000 })
  note: string;
}
