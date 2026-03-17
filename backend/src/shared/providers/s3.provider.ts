import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@config/env";

const PRESIGNED_URL_EXPIRES_IN = 300; // 5 minutes

@Injectable()
export class S3Provider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.bucket = env.AWS_S3_BUCKET;
    this.region = env.AWS_REGION;
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async generatePresignedPutUrl(
    key: string,
    mimeType: string,
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN,
    });

    const publicUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { uploadUrl, publicUrl };
  }

  // Extracts the S3 object key from a full public URL
  extractKeyFromUrl(url: string): string | null {
    const baseUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/`;
    if (url.startsWith(baseUrl)) {
      return url.slice(baseUrl.length);
    }
    return null;
  }

  async deleteObject(url: string): Promise<void> {
    const key = this.extractKeyFromUrl(url);
    if (!key) return; // Not an S3 URL from this bucket — skip silently

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }
}
