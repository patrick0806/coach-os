import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UpgradeService } from "../upgrade.service";

const mockCurrentUser = {
  sub: "personal@example.com",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockCurrentPlan = {
  id: "plan-basico-id",
  name: "Basico",
  order: 0,
  maxStudents: 3,
  isActive: true,
};

const mockTargetPlan = {
  id: "plan-pro-id",
  name: "Pro",
  order: 1,
  maxStudents: 10,
  isActive: true,
};

const mockPersonal = {
  id: "personal-id",
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  subscriptionStatus: "active",
  subscriptionPlanId: "plan-basico-id",
};

describe("UpgradeService", () => {
  let service: UpgradeService;
  let personalsRepository: {
    findById: ReturnType<typeof vi.fn>;
    updateSubscription: ReturnType<typeof vi.fn>;
  };
  let plansRepository: { findById: ReturnType<typeof vi.fn> };
  let stripeProvider: {
    client: {
      subscriptions: {
        retrieve: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
    };
    isConfigured: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.stubEnv("STRIPE_PRICE_PRO", "price_test_pro_123");
    personalsRepository = {
      findById: vi.fn(),
      updateSubscription: vi.fn(),
    };
    plansRepository = { findById: vi.fn() };
    stripeProvider = {
      isConfigured: vi.fn().mockReturnValue(true),
      client: {
        subscriptions: {
          retrieve: vi.fn().mockResolvedValue({
            id: "sub_123",
            items: { data: [{ id: "si_123" }] },
          }),
          update: vi.fn().mockResolvedValue({ id: "sub_123" }),
        },
      },
    };
    service = new UpgradeService(personalsRepository as any, plansRepository as any, stripeProvider as any);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("execute", () => {
    it("should upgrade subscription to higher plan", async () => {
      personalsRepository.findById.mockResolvedValue(mockPersonal);
      plansRepository.findById
        .mockResolvedValueOnce(mockCurrentPlan)
        .mockResolvedValueOnce(mockTargetPlan);
      personalsRepository.updateSubscription.mockResolvedValue(mockPersonal);

      await service.execute("plan-pro-id", mockCurrentUser);

      expect(stripeProvider.client.subscriptions.update).toHaveBeenCalledWith(
        "sub_123",
        expect.objectContaining({ proration_behavior: "always_invoice" }),
      );
      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id",
        expect.objectContaining({ subscriptionPlanId: "plan-pro-id" }),
      );
    });

    it("should throw NotFoundException when personal not found", async () => {
      personalsRepository.findById.mockResolvedValue(null);

      await expect(service.execute("plan-pro-id", mockCurrentUser)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when personal has no active subscription", async () => {
      personalsRepository.findById.mockResolvedValue({
        ...mockPersonal,
        stripeSubscriptionId: null,
        subscriptionStatus: null,
      });

      await expect(service.execute("plan-pro-id", mockCurrentUser)).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException when target plan not found", async () => {
      personalsRepository.findById.mockResolvedValue(mockPersonal);
      plansRepository.findById.mockResolvedValueOnce(mockCurrentPlan).mockResolvedValueOnce(null);

      await expect(service.execute("invalid-plan", mockCurrentUser)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when target plan is not higher tier", async () => {
      personalsRepository.findById.mockResolvedValue(mockPersonal);
      // current plan and target plan same order — not an upgrade
      plansRepository.findById
        .mockResolvedValueOnce(mockCurrentPlan)
        .mockResolvedValueOnce({ ...mockTargetPlan, order: 0 });

      await expect(service.execute("plan-pro-id", mockCurrentUser)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when Stripe is not configured", async () => {
      stripeProvider.isConfigured.mockReturnValue(false);
      personalsRepository.findById.mockResolvedValue(mockPersonal);

      await expect(service.execute("plan-pro-id", mockCurrentUser)).rejects.toThrow(BadRequestException);
    });
  });
});
