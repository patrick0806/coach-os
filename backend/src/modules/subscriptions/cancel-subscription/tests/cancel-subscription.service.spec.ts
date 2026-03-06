import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CancelSubscriptionService } from "../cancel-subscription.service";

const mockCurrentUser = {
  sub: "personal@example.com",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPersonal = {
  id: "personal-id",
  stripeSubscriptionId: "sub_123",
  subscriptionStatus: "active",
};

describe("CancelSubscriptionService", () => {
  let service: CancelSubscriptionService;
  let personalsRepository: { findById: ReturnType<typeof vi.fn> };
  let stripeProvider: { client: { subscriptions: { update: ReturnType<typeof vi.fn> } }; isConfigured: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    personalsRepository = { findById: vi.fn() };
    stripeProvider = {
      isConfigured: vi.fn().mockReturnValue(true),
      client: {
        subscriptions: {
          update: vi.fn().mockResolvedValue({ id: "sub_123", cancel_at_period_end: true }),
        },
      },
    };
    service = new CancelSubscriptionService(personalsRepository as any, stripeProvider as any);
  });

  describe("execute", () => {
    it("should cancel subscription at period end", async () => {
      personalsRepository.findById.mockResolvedValue(mockPersonal);

      await service.execute(mockCurrentUser);

      expect(stripeProvider.client.subscriptions.update).toHaveBeenCalledWith("sub_123", {
        cancel_at_period_end: true,
      });
    });

    it("should throw NotFoundException when personal is not found", async () => {
      personalsRepository.findById.mockResolvedValue(null);

      await expect(service.execute(mockCurrentUser)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when personal has no active subscription", async () => {
      personalsRepository.findById.mockResolvedValue({
        ...mockPersonal,
        stripeSubscriptionId: null,
        subscriptionStatus: null,
      });

      await expect(service.execute(mockCurrentUser)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when subscription is already canceled", async () => {
      personalsRepository.findById.mockResolvedValue({
        ...mockPersonal,
        subscriptionStatus: "canceled",
      });

      await expect(service.execute(mockCurrentUser)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when Stripe is not configured", async () => {
      stripeProvider.isConfigured.mockReturnValue(false);
      personalsRepository.findById.mockResolvedValue(mockPersonal);

      await expect(service.execute(mockCurrentUser)).rejects.toThrow(BadRequestException);
    });
  });
});
