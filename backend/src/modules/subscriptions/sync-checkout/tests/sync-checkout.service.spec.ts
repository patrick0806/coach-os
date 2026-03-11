import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { SyncCheckoutService } from "../sync-checkout.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPersonal = {
  id: "personal-id",
  userId: "user-id",
  slug: "john-doe",
  stripeCustomerId: "cus_test_123",
  subscriptionStatus: "trialing",
  subscriptionPlanId: null,
  subscriptionExpiresAt: null,
};

const mockSession = {
  id: "cs_test_abc",
  status: "complete",
  payment_status: "paid",
  customer: "cus_test_123",
  subscription: "sub_test_456",
  metadata: { planId: "plan-pro-id" },
};

describe("SyncCheckoutService", () => {
  let service: SyncCheckoutService;
  let personalsRepository: {
    findById: ReturnType<typeof vi.fn>;
    updateSubscription: ReturnType<typeof vi.fn>;
  };
  let stripeProvider: {
    isConfigured: ReturnType<typeof vi.fn>;
    client: {
      checkout: {
        sessions: { retrieve: ReturnType<typeof vi.fn> };
      };
    };
  };

  beforeEach(() => {
    personalsRepository = {
      findById: vi.fn().mockResolvedValue(mockPersonal),
      updateSubscription: vi.fn().mockResolvedValue(mockPersonal),
    };
    stripeProvider = {
      isConfigured: vi.fn().mockReturnValue(true),
      client: {
        checkout: {
          sessions: {
            retrieve: vi.fn().mockResolvedValue(mockSession),
          },
        },
      },
    };
    service = new SyncCheckoutService(
      personalsRepository as any,
      stripeProvider as any,
    );
  });

  describe("execute", () => {
    it("should update subscription to active when session is paid and complete", async () => {
      await service.execute("cs_test_abc", mockCurrentUser);

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        mockPersonal.id,
        expect.objectContaining({
          stripeSubscriptionId: "sub_test_456",
          subscriptionStatus: "active",
          subscriptionPlanId: "plan-pro-id",
          accessStatus: "active",
          subscriptionExpiresAt: null,
        }),
      );
    });

    it("should throw BadRequestException when Stripe is not configured", async () => {
      stripeProvider.isConfigured.mockReturnValue(false);

      await expect(
        service.execute("cs_test_abc", mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when session is not complete", async () => {
      stripeProvider.client.checkout.sessions.retrieve.mockResolvedValue({
        ...mockSession,
        status: "open",
        payment_status: "unpaid",
      });

      await expect(
        service.execute("cs_test_abc", mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when session payment_status is not paid", async () => {
      stripeProvider.client.checkout.sessions.retrieve.mockResolvedValue({
        ...mockSession,
        payment_status: "unpaid",
      });

      await expect(
        service.execute("cs_test_abc", mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException when personal is not found", async () => {
      personalsRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("cs_test_abc", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when session customer does not match personal", async () => {
      stripeProvider.client.checkout.sessions.retrieve.mockResolvedValue({
        ...mockSession,
        customer: "cus_different_999",
      });

      await expect(
        service.execute("cs_test_abc", mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should handle planId null in metadata gracefully", async () => {
      stripeProvider.client.checkout.sessions.retrieve.mockResolvedValue({
        ...mockSession,
        metadata: {},
      });

      await service.execute("cs_test_abc", mockCurrentUser);

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        mockPersonal.id,
        expect.objectContaining({ subscriptionPlanId: null }),
      );
    });
  });
});
