import { describe, it, expect, beforeEach, vi } from "vitest";

import { UploadImageService } from "../upload-image.service";

describe("UploadImageService", () => {
  let service: UploadImageService;
  let s3Provider: { generatePresignedPutUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    s3Provider = { generatePresignedPutUrl: vi.fn() };
    service = new UploadImageService(s3Provider as any);
  });

  describe("execute", () => {
    it("should return uploadUrl and publicUrl", async () => {
      s3Provider.generatePresignedPutUrl.mockResolvedValue({
        uploadUrl: "https://s3.amazonaws.com/bucket/key?signature=xyz",
        publicUrl: "https://bucket.s3.us-east-1.amazonaws.com/key",
      });

      const result = await service.execute("personal-id", {
        fileName: "photo.jpg",
        mimeType: "image/jpeg",
        imageType: "profilePhoto",
      });

      expect(result).toEqual({
        uploadUrl: expect.stringContaining("https://"),
        publicUrl: expect.stringContaining("https://"),
      });

      expect(s3Provider.generatePresignedPutUrl).toHaveBeenCalledWith(
        expect.stringContaining("personals/personal-id/profilePhoto/"),
        "image/jpeg",
      );
    });

    it("should sanitize the file name in the S3 key", async () => {
      s3Provider.generatePresignedPutUrl.mockResolvedValue({
        uploadUrl: "https://s3.amazonaws.com/bucket/key",
        publicUrl: "https://bucket.s3.us-east-1.amazonaws.com/key",
      });

      await service.execute("personal-id", {
        fileName: "my photo with spaces!.jpg",
        mimeType: "image/jpeg",
        imageType: "lpHeroImage",
      });

      const calledKey = s3Provider.generatePresignedPutUrl.mock.calls[0][0];
      expect(calledKey).not.toContain(" ");
      expect(calledKey).not.toContain("!");
    });
  });
});
