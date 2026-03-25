import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { CreateCheckoutSessionUseCase } from "../createCheckoutSession.useCase";

vi.mock("@config/env", () => ({
  env: { APP_URL: "http://localhost:3000" },
}));

const PLAN_UUID = "d5f8c3a2-e1b4-4f7d-9c6e-2a0b8f3d1e5c";

const makePersonal = (overrides = {}) => ({
  id: "personal-id-1",
  userId: "user-id-1",
  stripeCustomerId: "cus_test123",
  stripeSubscriptionId: null,
  subscriptionStatus: null,
  subscriptionPlanId: PLAN_UUID,
  ...overrides,
});

const makePlan = (overrides = {}) => ({
  id: PLAN_UUID,
  name: "Pro",
  stripePriceId: "price_test123",
  ...overrides,
});

const makeUser = (overrides = {}) => ({
  id: "user-id-1",
  email: "coach@example.com",
  name: "Coach Name",
  ...overrides,
});

const makeStripeProvider = (configured = true) => ({
  isConfigured: vi.fn().mockReturnValue(configured),
  client: {
    customers: {
      create: vi.fn().mockResolvedValue({ id: "cus_new123" }),
    },
    subscriptions: {
      cancel: vi.fn().mockResolvedValue({}),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/pay/test" }),
      },
    },
  },
});

const makePersonalsRepository = (personal = makePersonal()) => ({
  findById: vi.fn().mockResolvedValue(personal),
  updateSubscription: vi.fn().mockResolvedValue(undefined),
});

const makeUsersRepository = (user = makeUser()) => ({
  findById: vi.fn().mockResolvedValue(user),
});

const makePlansRepository = (plan = makePlan()) => ({
  findById: vi.fn().mockResolvedValue(plan),
});

describe("CreateCheckoutSessionUseCase", () => {
  let useCase: CreateCheckoutSessionUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let stripeProvider: ReturnType<typeof makeStripeProvider>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    usersRepository = makeUsersRepository();
    plansRepository = makePlansRepository();
    stripeProvider = makeStripeProvider();
    useCase = new CreateCheckoutSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );
  });

  it("should create checkout session and return URL", async () => {
    const result = await useCase.execute("personal-id-1");

    expect(stripeProvider.client.checkout.sessions.create).toHaveBeenCalledWith({
      mode: "subscription",
      customer: "cus_test123",
      line_items: [{ price: "price_test123", quantity: 1 }],
      success_url: "http://localhost:3000/assinatura?checkout=success",
      cancel_url: "http://localhost:3000/assinatura?checkout=cancelled",
    });
    expect(result).toEqual({ url: "https://checkout.stripe.com/pay/test" });
  });

  it("should cancel existing trialing subscription before creating checkout", async () => {
    personalsRepository = makePersonalsRepository(
      makePersonal({ stripeSubscriptionId: "sub_trial123", subscriptionStatus: "trialing" }),
    );
    useCase = new CreateCheckoutSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );

    await useCase.execute("personal-id-1");

    expect(stripeProvider.client.subscriptions.cancel).toHaveBeenCalledWith("sub_trial123");
  });

  it("should not cancel active subscription before creating checkout", async () => {
    personalsRepository = makePersonalsRepository(
      makePersonal({ stripeSubscriptionId: "sub_active123", subscriptionStatus: "active" }),
    );
    useCase = new CreateCheckoutSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );

    await useCase.execute("personal-id-1");

    expect(stripeProvider.client.subscriptions.cancel).not.toHaveBeenCalled();
  });

  it("should lazily create Stripe customer when personal has no stripeCustomerId", async () => {
    personalsRepository = makePersonalsRepository(makePersonal({ stripeCustomerId: null }));
    useCase = new CreateCheckoutSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );

    await useCase.execute("personal-id-1");

    expect(stripeProvider.client.customers.create).toHaveBeenCalledWith({
      email: "coach@example.com",
      name: "Coach Name",
      metadata: { userId: "user-id-1" },
    });
    expect(personalsRepository.updateSubscription).toHaveBeenCalledWith("personal-id-1", {
      stripeCustomerId: "cus_new123",
    });
  });

  it("should throw BadRequestException when Stripe is not configured", async () => {
    stripeProvider = makeStripeProvider(false);
    useCase = new CreateCheckoutSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );

    await expect(useCase.execute("personal-id-1")).rejects.toThrow(BadRequestException);
  });

  it("should throw NotFoundException when personal is not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id")).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when personal has no plan", async () => {
    personalsRepository = makePersonalsRepository(makePersonal({ subscriptionPlanId: null }));
    useCase = new CreateCheckoutSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );

    await expect(useCase.execute("personal-id-1")).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when plan has no Stripe price", async () => {
    plansRepository = makePlansRepository(makePlan({ stripePriceId: null }));
    useCase = new CreateCheckoutSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      plansRepository as any,
      stripeProvider as any,
    );

    await expect(useCase.execute("personal-id-1")).rejects.toThrow(BadRequestException);
  });
});
