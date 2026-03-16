import { ApiProperty } from "@nestjs/swagger";

export class GetStudentResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty({ enum: ["active", "paused", "archived"] })
  status: string;

  @ApiProperty({ nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ nullable: true })
  goal: string | null;

  @ApiProperty({ nullable: true })
  observations: string | null;

  @ApiProperty({ nullable: true })
  physicalRestrictions: string | null;

  @ApiProperty({ nullable: true })
  currentStreak: number | null;

  @ApiProperty({ nullable: true })
  lastWorkoutDate: Date | null;

  @ApiProperty({ nullable: true })
  totalWorkouts: number | null;

  @ApiProperty({ nullable: true })
  createdAt: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt: Date | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}
