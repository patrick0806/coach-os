import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetPublicProfileController } from "../get-public-profile.controller";
import { GetPublicProfileService } from "../get-public-profile.service";

const mockPublicProfileResponse = {
  id: "personal-id",
  name: "John Doe",
  slug: "john-doe",
  bio: "Personal trainer specialist in strength.",
  profilePhoto: "https://s3.example.com/photo.jpg",
  themeColor: "#10b981",
  phoneNumber: "11999999999",
  lpTitle: "Transform your body",
  lpSubtitle: "Start today",
  lpHeroImage: "https://s3.example.com/hero.jpg",
  lpAboutTitle: "About me",
  lpAboutText: "I have 10 years of experience.",
  lpImage1: null,
  lpImage2: null,
  lpImage3: null,
  servicePlans: [
    {
      id: "plan-1",
      name: "Basic",
      description: "3 sessions per week",
      sessionsPerWeek: 3,
      durationMinutes: 60,
      price: "299.99",
    },
  ],
};

describe("GetPublicProfileController", () => {
  let controller: GetPublicProfileController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new GetPublicProfileController(
      service as unknown as GetPublicProfileService,
    );
  });

  describe("handle", () => {
    it("should return the public profile for a valid slug", async () => {
      service.execute.mockResolvedValue(mockPublicProfileResponse);

      const result = await controller.handle("john-doe");

      expect(result).toEqual(mockPublicProfileResponse);
      expect(service.execute).toHaveBeenCalledWith("john-doe");
    });

    it("should propagate NotFoundException when slug does not exist", async () => {
      service.execute.mockRejectedValue(new NotFoundException());

      await expect(controller.handle("unknown-slug")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
