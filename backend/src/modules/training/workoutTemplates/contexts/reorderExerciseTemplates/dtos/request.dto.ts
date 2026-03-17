import { ApiProperty } from "@nestjs/swagger";

class ReorderItemDTO {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 0 })
  order: number;
}

export class ReorderExerciseTemplatesRequestDTO {
  @ApiProperty({ type: [ReorderItemDTO] })
  items: ReorderItemDTO[];
}
