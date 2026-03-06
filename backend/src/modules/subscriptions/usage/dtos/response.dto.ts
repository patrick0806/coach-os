import { ApiProperty } from "@nestjs/swagger";

export class UsageDTO {
  @ApiProperty({ example: 4 })
  studentsUsed: number;

  @ApiProperty({ example: 10, nullable: true })
  studentsLimit: number | null;

  @ApiProperty({ example: "uuid-here", nullable: true })
  planId: string | null;

  @ApiProperty({ example: "Pro", nullable: true })
  planName: string | null;
}
