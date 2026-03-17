import { describe, it, expect, beforeEach, vi } from "vitest";

import { RequestPhotoUploadUseCase } from "../requestPhotoUpload.useCase";

const makeS3Provider = () => ({
  generatePresignedPutUrl: vi.fn().mockResolvedValue({
    uploadUrl: "https://s3.amazonaws.com/upload-url",
    publicUrl: "https://s3.amazonaws.com/public-url",
  }),
});

describe("RequestPhotoUploadUseCase", () => {
  let useCase: RequestPhotoUploadUseCase;
  let s3Provider: ReturnType<typeof makeS3Provider>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    s3Provider = makeS3Provider();
    useCase = new RequestPhotoUploadUseCase(s3Provider as any);
  });

  it("should return uploadUrl and fileUrl for valid mimeType", async () => {
    const result = await useCase.execute(tenantId, { mimeType: "image/jpeg" });

    expect(result.uploadUrl).toBe("https://s3.amazonaws.com/upload-url");
    expect(result.fileUrl).toBe("https://s3.amazonaws.com/public-url");
  });

  it("should throw ValidationException for invalid mimeType", async () => {
    await expect(useCase.execute(tenantId, { mimeType: "video/mp4" })).rejects.toThrow();
  });

  it("should generate S3 key with correct format", async () => {
    await useCase.execute(tenantId, { mimeType: "image/png" });

    const calledKey = s3Provider.generatePresignedPutUrl.mock.calls[0][0] as string;
    expect(calledKey).toMatch(/^profiles\/tenant-id-1\/\d+\.png$/);
  });

  it("should enforce tenant isolation via S3 key prefix", async () => {
    await useCase.execute("other-tenant-id", { mimeType: "image/webp" });

    const calledKey = s3Provider.generatePresignedPutUrl.mock.calls[0][0] as string;
    expect(calledKey).toMatch(/^profiles\/other-tenant-id\//);
  });
});
