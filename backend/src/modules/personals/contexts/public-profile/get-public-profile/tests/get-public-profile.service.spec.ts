import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetPublicProfileService } from "../get-public-profile.service";

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
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockServicePlans = [
  {
    id: "plan-1",
    personalId: "personal-id",
    name: "Basic",
    description: "3 sessions per week",
    sessionsPerWeek: 3,
    durationMinutes: 60,
    price: "299.99",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "plan-2",
    personalId: "personal-id",
    name: "Premium",
    description: "5 sessions per week",
    sessionsPerWeek: 5,
    durationMinutes: 60,
    price: "449.99",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("GetPublicProfileService", () => {
  let service: GetPublicProfileService;
  let usersRepository: { findById: ReturnType<typeof vi.fn> };
  let personalsRepository: { findBySlug: ReturnType<typeof vi.fn> };
  let servicePlansRepository: {
    findActiveByPersonalId: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    usersRepository = { findById: vi.fn() };
    personalsRepository = { findBySlug: vi.fn() };
    servicePlansRepository = { findActiveByPersonalId: vi.fn() };

    service = new GetPublicProfileService(
      usersRepository as any,
      personalsRepository as any,
      servicePlansRepository as any,
    );
  });

  describe("execute", () => {
    it("should return the public profile with active service plans", async () => {
      personalsRepository.findBySlug.mockResolvedValue(mockPersonal);
      usersRepository.findById.mockResolvedValue(mockUser);
      servicePlansRepository.findActiveByPersonalId.mockResolvedValue(
        mockServicePlans,
      );

      const result = await service.execute("john-doe");

      expect(result).toEqual({
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
          {
            id: "plan-2",
            name: "Premium",
            description: "5 sessions per week",
            sessionsPerWeek: 5,
            durationMinutes: 60,
            price: "449.99",
          },
        ],
      });

      expect(personalsRepository.findBySlug).toHaveBeenCalledWith("john-doe");
      expect(usersRepository.findById).toHaveBeenCalledWith("user-id");
      expect(servicePlansRepository.findActiveByPersonalId).toHaveBeenCalledWith(
        "personal-id",
      );
    });

    it("should return empty servicePlans when personal has none", async () => {
      personalsRepository.findBySlug.mockResolvedValue(mockPersonal);
      usersRepository.findById.mockResolvedValue(mockUser);
      servicePlansRepository.findActiveByPersonalId.mockResolvedValue([]);

      const result = await service.execute("john-doe");

      expect(result.servicePlans).toEqual([]);
    });

    it("should throw NotFoundException when slug does not exist", async () => {
      personalsRepository.findBySlug.mockResolvedValue(null);

      await expect(service.execute("unknown-slug")).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.findById).not.toHaveBeenCalled();
      expect(
        servicePlansRepository.findActiveByPersonalId,
      ).not.toHaveBeenCalled();
    });
  });
});
