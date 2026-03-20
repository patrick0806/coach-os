import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { CancelSubscriptionUseCase } from "../cancelSubscription.useCase";

const CANCEL_AT = 1800000000;

const makePersonal = (overrides = {}) => ({
  id: "personal-id-1",
  userId: "user-id-1",
  stripeSubscriptionId: "sub_test123",
  subscriptionExpiresAt: null,
  ...overrides,
});

const makeUsersRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: "user-id-1", name: "João Silva", email: "joao@email.com" }),
});

const makeResendProvider = () => ({
  sendPlanCancelled: vi.fn().mockResolvedValue(undefined),
});

const makeStripeProvider = (configured = true) => ({
  isConfigured: vi.fn().mockReturnValue(configured),
  client: {
    subscriptions: {
      update: vi.fn().mockResolvedValue({ cancel_at: CANCEL_AT, cancel_at_period_end: true }),
    },
  },
});

const makePersonalsRepository = (personal = makePersonal()) => ({
  findById: vi.fn().mockResolvedValue(personal),
  updateSubscription: vi.fn().mockResolvedValue(undefined),
});

describe("CancelSubscriptionUseCase", () => {
  let useCase: CancelSubscriptionUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let stripeProvider: ReturnType<typeof makeStripeProvider>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let resendProvider: ReturnType<typeof makeResendProvider>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    stripeProvider = makeStripeProvider();
    usersRepository = makeUsersRepository();
    resendProvider = makeResendProvider();
    useCase = new CancelSubscriptionUseCase(
      personalsRepository as any,
      stripeProvider as any,
      usersRepository as any,
      resendProvider as any,
    );
  });

  it("should send cancellation email after successful cancellation", async () => {
    await useCase.execute("personal-id-1");

    expect(resendProvider.sendPlanCancelled).toHaveBeenCalledWith(
      expect.objectContaining({ to: "joao@email.com" }),
    );
  });

  it("should cancel at period end via Stripe and return expiry date", async () => {
    const result = await useCase.execute("personal-id-1");

    expect(stripeProvider.client.subscriptions.update).toHaveBeenCalledWith("sub_test123", {
      cancel_at_period_end: true,
    });
    expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
      "personal-id-1",
      { subscriptionExpiresAt: new Date(CANCEL_AT * 1000) },
    );
    expect(result.subscriptionExpiresAt).toBe(new Date(CANCEL_AT * 1000).toISOString());
  });

  it("should throw NotFoundException when personal is not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id")).rejects.toThrow(NotFoundException);
  });

  it("should return existing expiry when Stripe is not configured", async () => {
    const expiry = new Date("2025-12-31T00:00:00Z");
    personalsRepository = makePersonalsRepository(makePersonal({ subscriptionExpiresAt: expiry }));
    stripeProvider = makeStripeProvider(false);
    useCase = new CancelSubscriptionUseCase(
      personalsRepository as any,
      stripeProvider as any,
      usersRepository as any,
      resendProvider as any,
    );

    const result = await useCase.execute("personal-id-1");

    expect(stripeProvider.client.subscriptions.update).not.toHaveBeenCalled();
    expect(result.subscriptionExpiresAt).toBe(expiry.toISOString());
  });

  it("should skip Stripe update when personal has no stripeSubscriptionId", async () => {
    personalsRepository = makePersonalsRepository(makePersonal({ stripeSubscriptionId: null }));
    useCase = new CancelSubscriptionUseCase(
      personalsRepository as any,
      stripeProvider as any,
      usersRepository as any,
      resendProvider as any,
    );

    await useCase.execute("personal-id-1");

    expect(stripeProvider.client.subscriptions.update).not.toHaveBeenCalled();
  });
});
