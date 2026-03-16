import { ApiProperty } from "@nestjs/swagger";

export class RequestUploadUrlRequestDTO {
  @ApiProperty({
    example: "image/jpeg",
    enum: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
  })
  mimeType: string;
}
