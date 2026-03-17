import { ApiProperty } from "@nestjs/swagger";

export class RequestPhotoUploadResponseDTO {
  @ApiProperty({ example: "https://s3.amazonaws.com/bucket/...?presigned" })
  uploadUrl: string;

  @ApiProperty({ example: "https://bucket.s3.us-east-1.amazonaws.com/progress-photos/..." })
  fileUrl: string;
}
