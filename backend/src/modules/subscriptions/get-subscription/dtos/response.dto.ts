import { ApiProperty } from "@nestjs/swagger";

class SubscriptionPlanDTO {
  @ApiProperty({ example: "uuid-here" })
  id: string;

  @ApiProperty({ example: "Pro" })
  name: string;

  @ApiProperty({ example: "29.90" })
  price: string;

  @ApiProperty({ example: ["Ate 10 alunos"], type: [String] })
  benefits: string[];
}

export class SubscriptionStatusDTO {
  @ApiProperty({ example: "active", nullable: true })
  status: string | null;

  @ApiProperty({ type: SubscriptionPlanDTO, nullable: true })
  plan: SubscriptionPlanDTO | null;

  @ApiProperty({ example: "2026-12-31T00:00:00.000Z", nullable: true })
  expiresAt: Date | null;
}
