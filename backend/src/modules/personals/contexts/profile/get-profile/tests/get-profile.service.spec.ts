import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetProfileService } from "../get-profile.service";

const mockUser = {
  id: "user-id",
  name: "John Doe",
  email: "john@example.com",
  password: "hashed",
  role: "PERSONAL",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPersonal = {
  id: "personal-id",
  userId: "user-id",
  slug: "john-doe",
  bio: "My bio",
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
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GetProfileService", () => {
  let service: GetProfileService;
  let usersRepository: { findById: ReturnType<typeof vi.fn> };
  let personalsRepository: { findByUserId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    usersRepository = { findById: vi.fn() };
    personalsRepository = { findByUserId: vi.fn() };

    service = new GetProfileService(
      usersRepository as any,
      personalsRepository as any,
    );
  });

  describe("execute", () => {
    it("should return the personal profile successfully", async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      personalsRepository.findByUserId.mockResolvedValue(mockPersonal);

      const result = await service.execute("user-id");

      expect(result).toEqual({
        id: "personal-id",
        userId: "user-id",
        name: "John Doe",
        email: "john@example.com",
        slug: "john-doe",
        bio: "My bio",
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
      });

      expect(usersRepository.findById).toHaveBeenCalledWith("user-id");
      expect(personalsRepository.findByUserId).toHaveBeenCalledWith("user-id");
    });

    it("should throw NotFoundException when personal profile does not exist", async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      personalsRepository.findByUserId.mockResolvedValue(null);

      await expect(service.execute("user-id")).rejects.toThrow(NotFoundException);
    });
  });
});
