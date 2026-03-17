import { ApiProperty } from "@nestjs/swagger";

export class StartWorkoutSessionRequestDTO {
  @ApiProperty({ example: "student-id-1" })
  studentId: string;

  @ApiProperty({ example: "workout-day-id-1" })
  workoutDayId: string;

  @ApiProperty({ example: "2024-01-01T10:00:00Z", required: false })
  startedAt?: string;
}
