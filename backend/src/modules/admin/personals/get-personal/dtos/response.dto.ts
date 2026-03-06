import { ApiProperty } from "@nestjs/swagger";

export class AdminPersonalDetailDTO {
  @ApiProperty({ example: "uuid-here" })
  id: string;

  @ApiProperty({ example: "uuid-here" })
  userId: string;

  @ApiProperty({ example: "john-doe" })
  slug: string;

  @ApiProperty({ example: "John Doe" })
  name: string;

  @ApiProperty({ example: "john@example.com" })
  email: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: "active", nullable: true })
  subscriptionStatus: string | null;

  @ApiProperty({ example: "uuid-here", nullable: true })
  subscriptionPlanId: string | null;

  @ApiProperty({ example: "Pro", nullable: true })
  subscriptionPlanName: string | null;

  @ApiProperty({ example: "2026-12-31T00:00:00.000Z", nullable: true })
  subscriptionExpiresAt: Date | null;

  @ApiProperty({ example: "cus_123", nullable: true })
  stripeCustomerId: string | null;

  @ApiProperty({ example: "Personal trainer certificado", nullable: true })
  bio: string | null;

  @ApiProperty({ example: "https://example.com/photo.jpg", nullable: true })
  profilePhoto: string | null;

  @ApiProperty({ example: "+5511999999999", nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ example: "2026-01-01T00:00:00.000Z" })
  createdAt: Date;
}
