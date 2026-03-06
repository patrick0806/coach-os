import { ApiProperty } from "@nestjs/swagger";

export class AdminPersonalItemDTO {
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

  @ApiProperty({ example: "Pro", nullable: true })
  subscriptionPlanName: string | null;

  @ApiProperty({ example: "2026-01-01T00:00:00.000Z" })
  createdAt: Date;
}

export class PaginatedPersonalsDTO {
  @ApiProperty({ type: [AdminPersonalItemDTO] })
  content: AdminPersonalItemDTO[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  size: number;

  @ApiProperty({ example: 1 })
  totalElements: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
