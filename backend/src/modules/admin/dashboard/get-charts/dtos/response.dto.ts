import { ApiProperty } from "@nestjs/swagger";

class PlanDistributionItemDTO {
  @ApiProperty({ example: "Pro" })
  planName: string;

  @ApiProperty({ example: 3 })
  count: number;

  @ApiProperty({ example: 75 })
  percentage: number;
}

class RevenuePointDTO {
  @ApiProperty({ example: "2026-02" })
  month: string;

  @ApiProperty({ example: 119.7 })
  amount: number;
}

export class ChartsDTO {
  @ApiProperty({ type: [PlanDistributionItemDTO] })
  planDistribution: PlanDistributionItemDTO[];

  @ApiProperty({ type: [RevenuePointDTO] })
  revenue: RevenuePointDTO[];
}
