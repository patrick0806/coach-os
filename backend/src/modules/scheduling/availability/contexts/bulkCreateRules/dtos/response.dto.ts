import { ApiProperty } from "@nestjs/swagger";

import { CreateAvailabilityRuleResponseDTO } from "../../createRule/dtos/response.dto";

export class BulkCreateAvailabilityRulesResponseDTO {
  @ApiProperty({ type: [CreateAvailabilityRuleResponseDTO] })
  created: CreateAvailabilityRuleResponseDTO[];

  @ApiProperty({ example: 2, description: "Number of rules skipped due to conflicts" })
  conflicts: number;
}
