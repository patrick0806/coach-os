import { ApiProperty } from "@nestjs/swagger";

export class StudentListItemDTO {
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

  @ApiProperty()
  currentStreak: number | null;

  @ApiProperty({ nullable: true })
  lastWorkoutDate: Date | null;

  @ApiProperty()
  totalWorkouts: number | null;

  @ApiProperty({ nullable: true })
  createdAt: Date | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class ListStudentsResponseDTO {
  @ApiProperty({ type: [StudentListItemDTO] })
  content: StudentListItemDTO[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  size: number;

  @ApiProperty()
  totalElements: number;

  @ApiProperty()
  totalPages: number;
}
