import { ApiProperty } from "@nestjs/swagger";

export class CreateExerciseExecutionRequestDTO {
  @ApiProperty({ example: "session-id-1" })
  workoutSessionId: string;

  @ApiProperty({ example: "student-exercise-id-1" })
  studentExerciseId: string;

  @ApiProperty({ example: "exercise-id-1" })
  exerciseId: string;

  @ApiProperty({ example: 1, required: false })
  order?: number;
}
