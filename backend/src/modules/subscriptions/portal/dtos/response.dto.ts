import { ApiProperty } from "@nestjs/swagger";

export class PortalDTO {
  @ApiProperty({ example: "https://billing.stripe.com/portal/cs_test_123" })
  portalUrl: string;
}
