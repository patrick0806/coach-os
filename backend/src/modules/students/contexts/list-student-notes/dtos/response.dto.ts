import { ApiProperty } from "@nestjs/swagger";

import { StudentNoteResponseDTO } from "../../create-student-note/dtos/response.dto";

export class PaginatedStudentNotesResponseDTO {
  @ApiProperty({ type: [StudentNoteResponseDTO] })
  items: StudentNoteResponseDTO[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  size: number;

  @ApiProperty()
  total: number;
}
