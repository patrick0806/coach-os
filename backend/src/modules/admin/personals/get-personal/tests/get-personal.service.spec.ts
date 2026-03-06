import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetPersonalService } from "../get-personal.service";

const mockPersonalDetail = {
  id: "personal-1",
  userId: "user-1",
  slug: "john-doe",
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  subscriptionStatus: "active",
  subscriptionPlanId: "plan-pro-id",
  subscriptionPlanName: "Pro",
  subscriptionExpiresAt: null,
  stripeCustomerId: "cus_123",
  bio: "Personal trainer",
  profilePhoto: null,
  phoneNumber: "+55119999",
  createdAt: new Date("2026-01-01"),
};

describe("GetPersonalService", () => {
  let service: GetPersonalService;
  let adminPersonalsRepository: { findByIdWithUser: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    adminPersonalsRepository = { findByIdWithUser: vi.fn() };
    service = new GetPersonalService(adminPersonalsRepository as any);
  });

  describe("execute", () => {
    it("should return personal detail when found", async () => {
      adminPersonalsRepository.findByIdWithUser.mockResolvedValue(mockPersonalDetail);

      const result = await service.execute("personal-1");

      expect(result).toEqual(mockPersonalDetail);
    });

    it("should throw NotFoundException when personal not found", async () => {
      adminPersonalsRepository.findByIdWithUser.mockResolvedValue(null);

      await expect(service.execute("nonexistent")).rejects.toThrow(NotFoundException);
    });
  });
});
