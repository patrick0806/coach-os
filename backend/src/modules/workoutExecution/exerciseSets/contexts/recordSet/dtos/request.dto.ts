import { ApiProperty } from "@nestjs/swagger";

export class RecordExerciseSetRequestDTO {
  @ApiProperty({ example: "execution-id-1" })
  exerciseExecutionId: string;

  @ApiProperty({ example: 1 })
  setNumber: number;

  @ApiProperty({ example: 10, required: false })
  plannedReps?: number;

  @ApiProperty({ example: 10, required: false })
  performedReps?: number;

  @ApiProperty({ example: 50.0, required: false })
  plannedWeight?: number;

  @ApiProperty({ example: 50.0, required: false })
  usedWeight?: number;

  @ApiProperty({ example: 60, required: false })
  restSeconds?: number;

  @ApiProperty({ example: "completed", enum: ["completed", "partial", "skipped"] })
  completionStatus: "completed" | "partial" | "skipped";
}
