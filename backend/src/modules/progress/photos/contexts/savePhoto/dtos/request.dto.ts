import { ApiProperty } from "@nestjs/swagger";

export class SaveProgressPhotoRequestDTO {
  @ApiProperty({ example: "https://bucket.s3.us-east-1.amazonaws.com/progress-photos/..." })
  mediaUrl: string;

  @ApiProperty({ example: "Front view", required: false })
  notes?: string;
}
