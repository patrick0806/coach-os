import { ApiProperty } from "@nestjs/swagger";

class ServicePlanDTO {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() price!: string;
  @ApiProperty() attendanceType!: string;
  @ApiProperty({ nullable: true }) sessionsPerWeek!: number | null;
  @ApiProperty({ nullable: true }) durationMinutes!: number | null;
}

export class CreateContractResponseDTO {
  @ApiProperty() id!: string;
  @ApiProperty() tenantId!: string;
  @ApiProperty() studentId!: string;
  @ApiProperty() servicePlanId!: string;
  @ApiProperty() status!: string;
  @ApiProperty() startDate!: Date;
  @ApiProperty({ nullable: true }) endDate!: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty({ type: ServicePlanDTO }) servicePlan!: ServicePlanDTO;
}
