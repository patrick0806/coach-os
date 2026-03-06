import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { GetProfileController } from "../get-profile.controller";
import { GetProfileService } from "../get-profile.service";

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
  bio: null,
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

describe("GetProfileController", () => {
  let controller: GetProfileController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new GetProfileController(service as unknown as GetProfileService);
  });

  describe("handle", () => {
    it("should return the personal profile", async () => {
      service.execute.mockResolvedValue(mockProfileResponse);

      const result = await controller.handle(mockCurrentUser);

      expect(result).toEqual(mockProfileResponse);
      expect(service.execute).toHaveBeenCalledWith("user-id");
    });
  });
});
