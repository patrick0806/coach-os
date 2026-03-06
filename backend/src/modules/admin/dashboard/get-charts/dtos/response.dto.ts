import { ApiProperty } from "@nestjs/swagger";

class PlanDistributionItemDTO {
  @ApiProperty({ example: "Pro" })
  planName: string;

  @ApiProperty({ example: 3 })
  count: number;

  @ApiProperty({ example: 75 })
  percentage: number;
}

class RevenueTimelineItemDTO {
  @ApiProperty({ example: "2026-02" })
  month: string;

  @ApiProperty({ example: 119.7 })
  mrr: number;
}

export class ChartsDTO {
  @ApiProperty({ type: [PlanDistributionItemDTO] })
  planDistribution: PlanDistributionItemDTO[];

  @ApiProperty({ type: [RevenueTimelineItemDTO] })
  revenueTimeline: RevenueTimelineItemDTO[];
}
