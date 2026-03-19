import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ChangePlanUseCase } from "../changePlan.useCase";

const PLAN_UUID = "d5f8c3a2-e1b4-4f7d-9c6e-2a0b8f3d1e5c";

const makePersonal = (overrides = {}) => ({
  id: "personal-id-1",
  stripeSubscriptionId: "sub_test123",
  subscriptionPlanId: "11111111-1111-1111-1111-111111111111",
  ...overrides,
});

const makePlan = (overrides = {}) => ({
  id: PLAN_UUID,
  name: "Pro",
  stripePriceId: "price_pro_test",
  maxStudents: 30,
  ...overrides,
});

const makeStripeClient = () => ({
  subscriptions: {
    retrieve: vi.fn().mockResolvedValue({
      items: { data: [{ id: "si_test123" }] },
    }),
    update: vi.fn().mockResolvedValue({}),
  },
});

const makePersonalsRepository = (personal = makePersonal()) => ({
  findById: vi.fn().mockResolvedValue(personal),
  updateSubscription: vi.fn().mockResolvedValue(undefined),
});

const makePlansRepository = (plan = makePlan()) => ({
  findById: vi.fn().mockResolvedValue(plan),
});

const makeStripeProvider = (configured = true) => {
  const client = makeStripeClient();
  return {
    isConfigured: vi.fn().mockReturnValue(configured),
    client,
  };
};

describe("ChangePlanUseCase", () => {
  let useCase: ChangePlanUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let stripeProvider: ReturnType<typeof makeStripeProvider>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    plansRepository = makePlansRepository();
    stripeProvider = makeStripeProvider();
    useCase = new ChangePlanUseCase(
      personalsRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );
  });

  it("should change plan and update Stripe subscription", async () => {
    await useCase.execute("personal-id-1", { planId: PLAN_UUID });

    expect(stripeProvider.client.subscriptions.retrieve).toHaveBeenCalledWith(
      "sub_test123",
      { expand: ["items"] },
    );
    expect(stripeProvider.client.subscriptions.update).toHaveBeenCalledWith(
      "sub_test123",
      expect.objectContaining({
        items: [{ id: "si_test123", price: "price_pro_test" }],
        proration_behavior: "always_invoice",
      }),
    );
    expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
      "personal-id-1",
      { subscriptionPlanId: PLAN_UUID },
    );
  });

  it("should throw NotFoundException when personal is not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", { planId: PLAN_UUID })).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw NotFoundException when plan is not found", async () => {
    plansRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("personal-id-1", { planId: PLAN_UUID })).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw BadRequestException when plan has no stripePriceId", async () => {
    plansRepository.findById.mockResolvedValue(makePlan({ stripePriceId: null }));

    await expect(useCase.execute("personal-id-1", { planId: PLAN_UUID })).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should skip Stripe update when Stripe is not configured", async () => {
    stripeProvider = makeStripeProvider(false);
    useCase = new ChangePlanUseCase(
      personalsRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );

    await useCase.execute("personal-id-1", { planId: PLAN_UUID });

    expect(stripeProvider.client.subscriptions.update).not.toHaveBeenCalled();
    expect(personalsRepository.updateSubscription).toHaveBeenCalledWith(
      "personal-id-1",
      { subscriptionPlanId: PLAN_UUID },
    );
  });

  it("should skip Stripe update when personal has no stripeSubscriptionId", async () => {
    personalsRepository = makePersonalsRepository(makePersonal({ stripeSubscriptionId: null }));
    useCase = new ChangePlanUseCase(
      personalsRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );

    await useCase.execute("personal-id-1", { planId: PLAN_UUID });

    expect(stripeProvider.client.subscriptions.update).not.toHaveBeenCalled();
  });

  it("should throw when planId is not a valid UUID", async () => {
    await expect(useCase.execute("personal-id-1", { planId: "not-a-uuid" })).rejects.toThrow();
  });
});
