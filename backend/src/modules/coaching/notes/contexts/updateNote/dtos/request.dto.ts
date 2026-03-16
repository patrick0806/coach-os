import { ApiProperty } from "@nestjs/swagger";

export class UpdateNoteRequestDTO {
  @ApiProperty({ example: "Nota atualizada com novas observações.", minLength: 1, maxLength: 5000 })
  note: string;
}
