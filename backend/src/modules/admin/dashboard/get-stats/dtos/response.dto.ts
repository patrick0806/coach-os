import { ApiProperty } from "@nestjs/swagger";

export class StatsDTO {
  @ApiProperty({ example: 119.7, description: "Monthly Recurring Revenue in BRL" })
  mrr: number;

  @ApiProperty({ example: 4 })
  totalSubscribers: number;

  @ApiProperty({ example: 2, description: "New active subscribers in the period" })
  newSubscribers: number;

  @ApiProperty({ example: 1, description: "Subscriptions canceled in the period" })
  churnCount: number;

  @ApiProperty({ example: 12, description: "Total students on the platform" })
  totalStudents: number;

  @ApiProperty({ example: 100, nullable: true, description: "Growth rate % vs previous period (null if no previous data)" })
  growthRate: number | null;
}
