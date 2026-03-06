import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { UploadImageController } from "../upload-image.controller";
import { UploadImageService } from "../upload-image.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  profileId: "personal-id",
  personalId: "personal-id",
  personalSlug: "john-doe",
};

describe("UploadImageController", () => {
  let controller: UploadImageController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new UploadImageController(
      service as unknown as UploadImageService,
    );
  });

  describe("handle", () => {
    it("should return uploadUrl and publicUrl", async () => {
      service.execute.mockResolvedValue({
        uploadUrl: "https://s3.amazonaws.com/bucket/key?sig=xyz",
        publicUrl: "https://bucket.s3.amazonaws.com/key",
      });

      const result = await controller.handle(
        {
          fileName: "photo.jpg",
          mimeType: "image/jpeg",
          imageType: "profilePhoto",
        },
        mockCurrentUser,
      );

      expect(result.uploadUrl).toBeDefined();
      expect(result.publicUrl).toBeDefined();
      expect(service.execute).toHaveBeenCalledWith("personal-id", {
        fileName: "photo.jpg",
        mimeType: "image/jpeg",
        imageType: "profilePhoto",
      });
    });

    it("should throw ValidationException for invalid imageType", async () => {
      await expect(
        controller.handle(
          { fileName: "photo.jpg", mimeType: "image/jpeg", imageType: "invalid" as any },
          mockCurrentUser,
        ),
      ).rejects.toThrow();

      expect(service.execute).not.toHaveBeenCalled();
    });

    it("should throw ValidationException for invalid mimeType", async () => {
      await expect(
        controller.handle(
          { fileName: "file.pdf", mimeType: "application/pdf", imageType: "profilePhoto" },
          mockCurrentUser,
        ),
      ).rejects.toThrow();

      expect(service.execute).not.toHaveBeenCalled();
    });
  });
});
