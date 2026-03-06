import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { GetSubscriptionService } from "../get-subscription.service";

const mockCurrentUser = {
  sub: "personal@example.com",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPersonal = {
  id: "personal-id",
  userId: "user-id",
  slug: "john-doe",
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  subscriptionStatus: "active",
  subscriptionPlanId: "plan-id",
  subscriptionExpiresAt: new Date("2026-12-31"),
};

const mockPlan = {
  id: "plan-id",
  name: "Pro",
  description: "Plano Pro",
  price: "29.90",
  highlighted: true,
  order: 1,
  benefits: ["Ate 10 alunos"],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GetSubscriptionService", () => {
  let service: GetSubscriptionService;
  let personalsRepository: { findById: ReturnType<typeof vi.fn> };
  let plansRepository: { findById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    personalsRepository = { findById: vi.fn() };
    plansRepository = { findById: vi.fn() };
    service = new GetSubscriptionService(personalsRepository as any, plansRepository as any);
  });

  describe("execute", () => {
    it("should return subscription info when personal has active subscription", async () => {
      personalsRepository.findById.mockResolvedValue(mockPersonal);
      plansRepository.findById.mockResolvedValue(mockPlan);

      const result = await service.execute(mockCurrentUser);

      expect(result.status).toBe("active");
      expect(result.plan).toBeDefined();
      expect(result.plan!.name).toBe("Pro");
      expect(result.expiresAt).toEqual(new Date("2026-12-31"));
    });

    it("should return null plan when personal has no subscription", async () => {
      personalsRepository.findById.mockResolvedValue({
        ...mockPersonal,
        subscriptionStatus: null,
        subscriptionPlanId: null,
        subscriptionExpiresAt: null,
      });

      const result = await service.execute(mockCurrentUser);

      expect(result.status).toBeNull();
      expect(result.plan).toBeNull();
    });

    it("should throw NotFoundException when personal is not found", async () => {
      personalsRepository.findById.mockResolvedValue(null);

      await expect(service.execute(mockCurrentUser)).rejects.toThrow(NotFoundException);
    });
  });
});
