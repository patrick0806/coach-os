import { ApiProperty } from "@nestjs/swagger";

export class RequestPhotoUploadRequestDTO {
  @ApiProperty({
    example: "image/jpeg",
    enum: ["image/jpeg", "image/png", "image/webp"],
  })
  mimeType: string;
}
