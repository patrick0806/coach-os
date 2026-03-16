import { ApiProperty } from "@nestjs/swagger";

export class RequestUploadUrlResponseDTO {
  @ApiProperty({ description: "Presigned URL to upload the file directly to S3" })
  uploadUrl: string;

  @ApiProperty({ description: "Final public URL of the file after upload" })
  fileUrl: string;
}
