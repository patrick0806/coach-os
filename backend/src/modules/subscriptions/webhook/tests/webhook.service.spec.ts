import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { WebhookService } from "../webhook.service";

const mockPersonal = {
  id: "personal-id",
  stripeCustomerId: "cus_123",
  subscriptionStatus: "active",
  subscriptionPlanId: "plan-id",
  subscriptionExpiresAt: new Date("2026-12-31"),
};

describe("WebhookService", () => {
  let service: WebhookService;
  let personalsRepository: {
    findByStripeCustomerId: ReturnType<typeof vi.fn>;
    updateSubscription: ReturnType<typeof vi.fn>;
  };
  let plansRepository: { findAllActive: ReturnType<typeof vi.fn> };
  let stripeProvider: { client: { webhooks: { constructEvent: ReturnType<typeof vi.fn> } }; isConfigured: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    personalsRepository = {
      findByStripeCustomerId: vi.fn(),
      updateSubscription: vi.fn(),
    };
    plansRepository = { findAllActive: vi.fn() };
    const constructEvent = vi.fn();
    stripeProvider = {
      isConfigured: vi.fn().mockReturnValue(true),
      client: {
        webhooks: { constructEvent },
      },
    };
    service = new WebhookService(
      personalsRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );
  });

  describe("execute", () => {
    it("should throw BadRequestException when signature is invalid", async () => {
      (stripeProvider.client.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error("No signatures found matching");
      });

      await expect(
        service.execute(Buffer.from("{}"), "invalid-sig"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should handle checkout.session.completed event", async () => {
      const event = {
        type: "checkout.session.completed",
        data: {
          object: {
            customer: "cus_123",
            subscription: "sub_new",
            metadata: { planId: "plan-id" },
          },
        },
      };
      (stripeProvider.client.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue(event);
      personalsRepository.findByStripeCustomerId.mockResolvedValue(mockPersonal);
      personalsRepository.updateSubscription.mockResolvedValue(mockPersonal);

      await service.execute(Buffer.from(JSON.stringify(event)), "valid-sig");

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id",
        expect.objectContaining({ stripeSubscriptionId: "sub_new" }),
      );
    });

    it("should handle customer.subscription.updated event", async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      const event = {
        type: "customer.subscription.updated",
        data: {
          object: {
            id: "sub_123",
            customer: "cus_123",
            status: "active",
            current_period_end: expiresAt,
          },
        },
      };
      (stripeProvider.client.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue(event);
      personalsRepository.findByStripeCustomerId.mockResolvedValue(mockPersonal);
      personalsRepository.updateSubscription.mockResolvedValue(mockPersonal);

      await service.execute(Buffer.from(JSON.stringify(event)), "valid-sig");

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id",
        expect.objectContaining({ subscriptionStatus: "active" }),
      );
    });

    it("should handle customer.subscription.deleted event", async () => {
      const event = {
        type: "customer.subscription.deleted",
        data: {
          object: { id: "sub_123", customer: "cus_123" },
        },
      };
      (stripeProvider.client.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue(event);
      personalsRepository.findByStripeCustomerId.mockResolvedValue(mockPersonal);
      personalsRepository.updateSubscription.mockResolvedValue(mockPersonal);

      await service.execute(Buffer.from(JSON.stringify(event)), "valid-sig");

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id",
        expect.objectContaining({ subscriptionStatus: "canceled", stripeSubscriptionId: null }),
      );
    });

    it("should silently ignore unhandled event types", async () => {
      const event = { type: "payment_intent.succeeded", data: { object: {} } };
      (stripeProvider.client.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue(event);

      await service.execute(Buffer.from(JSON.stringify(event)), "valid-sig");

      expect(personalsRepository.updateSubscription).not.toHaveBeenCalled();
    });
  });
});
