import { Injectable } from "@nestjs/common";

import { S3Provider } from "@shared/providers/s3.provider";

import { UploadImageRequestDTO } from "./dtos/request.dto";
import { UploadImageResponseDTO } from "./dtos/response.dto";

@Injectable()
export class UploadImageService {
  constructor(private readonly s3Provider: S3Provider) {}

  async execute(
    profileId: string,
    dto: UploadImageRequestDTO,
  ): Promise<UploadImageResponseDTO> {
    const sanitizedFileName = dto.fileName
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-");

    const key = `personals/${profileId}/${dto.imageType}/${Date.now()}-${sanitizedFileName}`;

    return this.s3Provider.generatePresignedPutUrl(key, dto.mimeType);
  }
}
