import { ApiProperty } from "@nestjs/swagger";

export class UpdateStudentExerciseRequestDTO {
  @ApiProperty({ example: 4, required: false })
  sets?: number;

  @ApiProperty({ example: 12, required: false, nullable: true })
  repetitions?: number | null;

  @ApiProperty({ example: "80.00", required: false, nullable: true })
  plannedWeight?: string | null;

  @ApiProperty({ example: 90, required: false, nullable: true })
  restSeconds?: number | null;

  @ApiProperty({ example: "30s", required: false, nullable: true })
  duration?: string | null;

  @ApiProperty({ example: "Focar na forma", required: false, nullable: true })
  notes?: string | null;
}
