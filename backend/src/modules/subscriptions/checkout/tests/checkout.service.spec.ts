import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CheckoutService } from "../checkout.service";

const mockCurrentUser = {
  sub: "personal@example.com",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
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
  stripePriceId: "price_test_pro_123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPersonal = {
  id: "personal-id",
  userId: "user-id",
  slug: "john-doe",
  stripeCustomerId: null,
  subscriptionStatus: null,
  subscriptionPlanId: null,
  subscriptionExpiresAt: null,
};

describe("CheckoutService", () => {
  let service: CheckoutService;
  let plansRepository: { findById: ReturnType<typeof vi.fn> };
  let personalsRepository: { findById: ReturnType<typeof vi.fn>; updateSubscription: ReturnType<typeof vi.fn> };
  let usersRepository: { findById: ReturnType<typeof vi.fn> };
  let stripeProvider: { client: { customers: { create: ReturnType<typeof vi.fn> }; checkout: { sessions: { create: ReturnType<typeof vi.fn> } } }; isConfigured: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    plansRepository = { findById: vi.fn() };
    personalsRepository = {
      findById: vi.fn(),
      updateSubscription: vi.fn(),
    };
    usersRepository = {
      findById: vi.fn().mockResolvedValue({ id: "user-id", email: "personal@example.com" }),
    };
    stripeProvider = {
      isConfigured: vi.fn().mockReturnValue(true),
      client: {
        customers: {
          create: vi.fn().mockResolvedValue({ id: "cus_123" }),
        },
        checkout: {
          sessions: {
            create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/pay/cs_test_123" }),
          },
        },
      },
    };
    service = new CheckoutService(
      plansRepository as any,
      personalsRepository as any,
      usersRepository as any,
      stripeProvider as any,
    );
  });

  describe("execute", () => {
    it("should return checkoutUrl when all data is valid", async () => {
      plansRepository.findById.mockResolvedValue(mockPlan);
      personalsRepository.findById.mockResolvedValue(mockPersonal);
      personalsRepository.updateSubscription.mockResolvedValue(mockPersonal);

      const result = await service.execute("plan-id", mockCurrentUser);

      expect(result).toEqual({ checkoutUrl: "https://checkout.stripe.com/pay/cs_test_123" });
    });

    it("should throw BadRequestException when plan is not found", async () => {
      plansRepository.findById.mockResolvedValue(null);

      await expect(service.execute("invalid-plan", mockCurrentUser)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when plan has no stripePriceId configured", async () => {
      plansRepository.findById.mockResolvedValue({ ...mockPlan, stripePriceId: null });
      personalsRepository.findById.mockResolvedValue(mockPersonal);

      await expect(service.execute("plan-id", mockCurrentUser)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when Stripe is not configured", async () => {
      stripeProvider.isConfigured.mockReturnValue(false);
      plansRepository.findById.mockResolvedValue(mockPlan);
      personalsRepository.findById.mockResolvedValue(mockPersonal);

      await expect(service.execute("plan-id", mockCurrentUser)).rejects.toThrow(BadRequestException);
    });

    it("should reuse existing stripeCustomerId when personal already has one", async () => {
      const personalWithCustomer = { ...mockPersonal, stripeCustomerId: "cus_existing" };
      plansRepository.findById.mockResolvedValue(mockPlan);
      personalsRepository.findById.mockResolvedValue(personalWithCustomer);

      await service.execute("plan-id", mockCurrentUser);

      expect(stripeProvider.client.customers.create).not.toHaveBeenCalled();
    });
  });
});
