import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { ProcessStripeEventUseCase } from "../processStripeEvent.useCase";

// Mock env module
vi.mock("@config/env", () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: "whsec_test",
    STRIPE_SECRET_KEY: "sk_test",
  },
}));

// Mock pino logger
vi.mock("@config/pino.config", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const makePersonal = (overrides = {}) => ({
  id: "personal-id-1",
  userId: "user-id-1",
  slug: "john-doe",
  accessStatus: "trialing" as const,
  subscriptionStatus: "trialing",
  stripeCustomerId: "cus_test123",
  stripeSubscriptionId: "sub_test123",
  subscriptionPlanId: "plan-id-1",
  subscriptionExpiresAt: null,
  trialEndsAt: null,
  trialStartedAt: null,
  ...overrides,
});

const makeUsersRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: "user-id-1", name: "João Silva", email: "joao@email.com" }),
});

const makeResendProvider = () => ({
  sendAccessLost: vi.fn().mockResolvedValue(undefined),
  sendPlanSubscribed: vi.fn().mockResolvedValue(undefined),
  sendPaymentFailed: vi.fn().mockResolvedValue(undefined),
  sendPaymentRetry: vi.fn().mockResolvedValue(undefined),
  sendTrialEndingSoon: vi.fn().mockResolvedValue(undefined),
});

const makePlan = (overrides = {}) => ({
  id: "plan-id-1",
  name: "Básico",
  stripePriceId: "price_basico",
  price: "29.90",
  maxStudents: 10,
  ...overrides,
});

const makePersonalsRepository = () => ({
  findByStripeCustomerId: vi.fn().mockResolvedValue(makePersonal()),
  updateSubscription: vi.fn().mockResolvedValue(undefined),
});

const makePlansRepository = () => ({
  findByStripePriceId: vi.fn().mockResolvedValue(makePlan()),
  findById: vi.fn().mockResolvedValue(makePlan()),
});

const makeStripeProvider = (eventType: string, eventData: object) => ({
  isConfigured: vi.fn().mockReturnValue(true),
  client: {
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({
        type: eventType,
        data: { object: eventData },
      }),
    },
  },
});

describe("ProcessStripeEventUseCase", () => {
  let useCase: ProcessStripeEventUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let resendProvider: ReturnType<typeof makeResendProvider>;

  const rawBody = Buffer.from("{}");
  const signature = "t=123,v1=abc";

  function buildUseCase(eventType: string, eventData: object) {
    const stripeProvider = makeStripeProvider(eventType, eventData);
    return new ProcessStripeEventUseCase(
      stripeProvider as any,
      personalsRepository as any,
      plansRepository as any,
      usersRepository as any,
      resendProvider as any,
    );
  }

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    plansRepository = makePlansRepository();
    usersRepository = makeUsersRepository();
    resendProvider = makeResendProvider();
  });

  describe("signature verification", () => {
    it("should return early when Stripe is not configured", async () => {
      const stripeProvider = {
        isConfigured: vi.fn().mockReturnValue(false),
        client: null,
      };
      useCase = new ProcessStripeEventUseCase(
        stripeProvider as any,
        personalsRepository as any,
        plansRepository as any,
        usersRepository as any,
        resendProvider as any,
      );

      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when signature verification fails", async () => {
      const stripeProvider = {
        isConfigured: vi.fn().mockReturnValue(true),
        client: {
          webhooks: {
            constructEvent: vi.fn().mockImplementation(() => {
              throw new Error("Invalid signature");
            }),
          },
        },
      };
      useCase = new ProcessStripeEventUseCase(
        stripeProvider as any,
        personalsRepository as any,
        plansRepository as any,
        usersRepository as any,
        resendProvider as any,
      );

      await expect(useCase.execute(rawBody, signature)).rejects.toThrow(BadRequestException);
    });
  });

  describe("customer.subscription.updated", () => {
    const subscription = {
      id: "sub_test123",
      customer: "cus_test123",
      status: "active",
      cancel_at: null,
      items: { data: [{ price: { id: "price_basico" } }] },
    };

    beforeEach(() => {
      useCase = buildUseCase("customer.subscription.updated", subscription);
    });

    it("should update subscription status and accessStatus", async () => {
      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id-1",
        expect.objectContaining({
          subscriptionStatus: "active",
          accessStatus: "active",
          stripeSubscriptionId: "sub_test123",
        }),
      );
      // cancel_at is null so subscriptionExpiresAt should NOT be included
      const call = personalsRepository.updateSubscription.mock.calls[0][1];
      expect(call).not.toHaveProperty("subscriptionExpiresAt");
    });

    it("should look up plan by stripePriceId and include planId", async () => {
      await useCase.execute(rawBody, signature);

      expect(plansRepository.findByStripePriceId).toHaveBeenCalledWith("price_basico");
      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id-1",
        expect.objectContaining({ subscriptionPlanId: "plan-id-1" }),
      );
    });

    it("should set accessStatus to past_due for past_due status", async () => {
      useCase = buildUseCase("customer.subscription.updated", {
        ...subscription, cancel_at: null,
        status: "past_due",
      });

      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id-1",
        expect.objectContaining({ accessStatus: "past_due" }),
      );
    });

    it("should set accessStatus to expired for canceled status", async () => {
      useCase = buildUseCase("customer.subscription.updated", {
        ...subscription, cancel_at: null,
        status: "canceled",
      });

      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id-1",
        expect.objectContaining({ accessStatus: "expired" }),
      );
    });

    it("should skip update when personal not found", async () => {
      personalsRepository.findByStripeCustomerId.mockResolvedValue(undefined);
      useCase = buildUseCase("customer.subscription.updated", { ...subscription, cancel_at: null });

      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).not.toHaveBeenCalled();
    });
  });

  describe("customer.subscription.deleted", () => {
    const subscription = {
      id: "sub_test123",
      customer: "cus_test123",
      status: "canceled",
      cancel_at: null,
      items: { data: [] },
    };

    beforeEach(() => {
      useCase = buildUseCase("customer.subscription.deleted", subscription);
    });

    it("should set accessStatus to expired and subscriptionStatus to canceled", async () => {
      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id-1",
        { subscriptionStatus: "canceled", accessStatus: "expired" },
      );
    });

    it("should send access lost email on subscription deleted", async () => {
      await useCase.execute(rawBody, signature);

      expect(resendProvider.sendAccessLost).toHaveBeenCalledWith(
        expect.objectContaining({ to: "joao@email.com" }),
      );
    });

    it("should skip when personal not found", async () => {
      personalsRepository.findByStripeCustomerId.mockResolvedValue(undefined);
      await useCase.execute(rawBody, signature);
      expect(personalsRepository.updateSubscription).not.toHaveBeenCalled();
    });
  });

  describe("invoice.paid", () => {
    const invoice = {
      customer: "cus_test123",
      period_end: 1800000000,
      amount_paid: 4990,
    };

    beforeEach(() => {
      useCase = buildUseCase("invoice.paid", invoice);
    });

    it("should set accessStatus to active when amount_paid > 0", async () => {
      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id-1",
        expect.objectContaining({ accessStatus: "active" }),
      );
    });

    it("should include subscriptionExpiresAt from invoice period", async () => {
      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id-1",
        expect.objectContaining({
          subscriptionExpiresAt: new Date(1800000000 * 1000),
        }),
      );
    });

    it("should send plan subscribed email on invoice paid", async () => {
      await useCase.execute(rawBody, signature);

      expect(resendProvider.sendPlanSubscribed).toHaveBeenCalledWith(
        expect.objectContaining({ to: "joao@email.com" }),
      );
    });

    it("should skip accessStatus update for trial invoice with amount_paid = 0", async () => {
      useCase = buildUseCase("invoice.paid", {
        customer: "cus_test123",
        period_end: 1800000000,
        amount_paid: 0,
      });

      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).not.toHaveBeenCalled();
    });

    it("should skip when personal not found", async () => {
      personalsRepository.findByStripeCustomerId.mockResolvedValue(undefined);
      await useCase.execute(rawBody, signature);
      expect(personalsRepository.updateSubscription).not.toHaveBeenCalled();
    });
  });

  describe("invoice.payment_failed", () => {
    const invoice = { customer: "cus_test123" };

    beforeEach(() => {
      useCase = buildUseCase("invoice.payment_failed", invoice);
    });

    it("should set accessStatus and subscriptionStatus to past_due", async () => {
      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
        "personal-id-1",
        { accessStatus: "past_due", subscriptionStatus: "past_due" },
      );
    });

    it("should send payment failed email when no next_payment_attempt", async () => {
      await useCase.execute(rawBody, signature);

      expect(resendProvider.sendPaymentFailed).toHaveBeenCalledWith(
        expect.objectContaining({ to: "joao@email.com" }),
      );
    });

    it("should send payment retry email when next_payment_attempt is set", async () => {
      useCase = buildUseCase("invoice.payment_failed", {
        customer: "cus_test123",
        next_payment_attempt: 1800000000,
      });

      await useCase.execute(rawBody, signature);

      expect(resendProvider.sendPaymentRetry).toHaveBeenCalledWith(
        expect.objectContaining({ to: "joao@email.com" }),
      );
    });

    it("should skip when personal not found", async () => {
      personalsRepository.findByStripeCustomerId.mockResolvedValue(undefined);
      await useCase.execute(rawBody, signature);
      expect(personalsRepository.updateSubscription).not.toHaveBeenCalled();
    });
  });

  describe("customer.subscription.trial_will_end", () => {
    const subscription = {
      id: "sub_test123",
      customer: "cus_test123",
      status: "trialing",
      trial_end: 1800000000,
      cancel_at: null,
      items: { data: [] },
    };

    beforeEach(() => {
      useCase = buildUseCase("customer.subscription.trial_will_end", subscription);
    });

    it("should send trial ending soon email", async () => {
      await useCase.execute(rawBody, signature);

      expect(resendProvider.sendTrialEndingSoon).toHaveBeenCalledWith(
        expect.objectContaining({ to: "joao@email.com" }),
      );
    });

    it("should skip when personal not found", async () => {
      personalsRepository.findByStripeCustomerId.mockResolvedValue(undefined);
      await useCase.execute(rawBody, signature);
      expect(resendProvider.sendTrialEndingSoon).not.toHaveBeenCalled();
    });
  });

  describe("unhandled event types", () => {
    it("should not call updateSubscription for unknown event types", async () => {
      useCase = buildUseCase("payment_intent.succeeded", {});

      await useCase.execute(rawBody, signature);

      expect(personalsRepository.updateSubscription).not.toHaveBeenCalled();
    });
  });
});
