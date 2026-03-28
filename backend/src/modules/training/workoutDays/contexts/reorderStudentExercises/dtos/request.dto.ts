import { ApiProperty } from "@nestjs/swagger";

class ReorderItemDTO {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 0 })
  order: number;
}

export class ReorderStudentExercisesRequestDTO {
  @ApiProperty({ type: [ReorderItemDTO] })
  items: ReorderItemDTO[];
}
