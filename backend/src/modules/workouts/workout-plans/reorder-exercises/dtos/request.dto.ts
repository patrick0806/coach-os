import { ApiProperty } from "@nestjs/swagger";

export class ReorderItemDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order: number;
}

export class ReorderExercisesDTO {
  @ApiProperty({ type: [ReorderItemDTO] })
  items: ReorderItemDTO[];
}
