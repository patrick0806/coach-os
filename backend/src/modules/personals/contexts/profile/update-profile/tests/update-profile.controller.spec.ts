import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { UpdateProfileController } from "../update-profile.controller";
import { UpdateProfileService } from "../update-profile.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  profileId: "personal-id",
  personalId: "personal-id",
  personalSlug: "john-doe",
};

const mockProfileResponse = {
  id: "personal-id",
  userId: "user-id",
  name: "John Doe",
  email: "john@example.com",
  slug: "john-doe",
  bio: "Updated bio",
  profilePhoto: null,
  themeColor: "#10b981",
  phoneNumber: null,
  lpTitle: null,
  lpSubtitle: null,
  lpHeroImage: null,
  lpAboutTitle: null,
  lpAboutText: null,
  lpImage1: null,
  lpImage2: null,
  lpImage3: null,
};

describe("UpdateProfileController", () => {
  let controller: UpdateProfileController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new UpdateProfileController(
      service as unknown as UpdateProfileService,
    );
  });

  describe("handle", () => {
    it("should update profile and return updated data", async () => {
      service.execute.mockResolvedValue(mockProfileResponse);

      const result = await controller.handle(
        { bio: "Updated bio" },
        mockCurrentUser,
      );

      expect(result).toEqual(mockProfileResponse);
      expect(service.execute).toHaveBeenCalledWith(
        "personal-id",
        "user-id",
        { bio: "Updated bio" },
      );
    });

    it("should throw ValidationException for invalid themeColor", async () => {
      await expect(
        controller.handle({ themeColor: "notacolor" }, mockCurrentUser),
      ).rejects.toThrow();

      expect(service.execute).not.toHaveBeenCalled();
    });

    it("should throw ValidationException for invalid URL in profilePhoto", async () => {
      await expect(
        controller.handle({ profilePhoto: "not-a-url" }, mockCurrentUser),
      ).rejects.toThrow();

      expect(service.execute).not.toHaveBeenCalled();
    });
  });
});
