import { ApiProperty } from "@nestjs/swagger";

export class StatsDTO {
  @ApiProperty({ example: 119.7, description: "Monthly Recurring Revenue in BRL" })
  mrr: number;

  @ApiProperty({ example: 4 })
  totalSubscribers: number;

  @ApiProperty({ example: 2, description: "New active subscribers in the period" })
  newSubscribers: number;

  @ApiProperty({ example: 4.5, description: "Churn rate % in the period (canceled / total active * 100)" })
  churnRate: number;

  @ApiProperty({ example: 12, description: "Total students on the platform" })
  totalStudents: number;
}
