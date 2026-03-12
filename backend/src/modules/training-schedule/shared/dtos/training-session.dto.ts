import { ApiProperty } from "@nestjs/swagger";

export class ScheduleRuleDTO {
  @ApiProperty() id: string;
  @ApiProperty() personalId: string;
  @ApiProperty() studentId: string;
  @ApiProperty() dayOfWeek: number;
  @ApiProperty({ nullable: true }) workoutPlanId: string | null;
  @ApiProperty({ nullable: true }) startTime: string | null;
  @ApiProperty({ nullable: true }) endTime: string | null;
  @ApiProperty({ enum: ["presential", "online", "rest"] }) sessionType: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class TrainingSessionDTO {
  @ApiProperty() id: string;
  @ApiProperty() personalId: string;
  @ApiProperty() studentId: string;
  @ApiProperty() scheduleRuleId: string;
  @ApiProperty({ nullable: true }) workoutPlanId: string | null;
  @ApiProperty({ nullable: true }) workoutSessionId: string | null;
  @ApiProperty() scheduledDate: string;
  @ApiProperty({ nullable: true }) startTime: string | null;
  @ApiProperty({ nullable: true }) endTime: string | null;
  @ApiProperty({ enum: ["pending", "completed", "cancelled"] }) status: string;
  @ApiProperty({ enum: ["presential", "online", "rest"] }) sessionType: string;
  @ApiProperty({ nullable: true }) cancelledAt: Date | null;
  @ApiProperty({ nullable: true }) cancellationReason: string | null;
  @ApiProperty({ nullable: true }) notes: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
