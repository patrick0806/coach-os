import { ApiProperty } from "@nestjs/swagger";

export class SaveProgressPhotoResponseDTO {
  @ApiProperty({ example: "d4e5f6a7-b8c9-0123-defa-234567890123" })
  id: string;

  @ApiProperty({ example: "c3d4e5f6-a7b8-9012-cdef-012345678902" })
  tenantId: string;

  @ApiProperty({ example: "b2c3d4e5-f6a7-8901-bcde-f01234567891" })
  studentId: string;

  @ApiProperty({ example: "https://bucket.s3.us-east-1.amazonaws.com/progress-photos/..." })
  mediaUrl: string;

  @ApiProperty({ example: "Front view", required: false })
  notes: string | null;

  @ApiProperty()
  createdAt: Date | null;
}
