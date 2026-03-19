import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { CreatePortalSessionUseCase } from "../createPortalSession.useCase";

vi.mock("@config/env", () => ({
  env: { APP_URL: "http://localhost:3000" },
}));

const makePersonal = (overrides = {}) => ({
  id: "personal-id-1",
  userId: "user-id-1",
  stripeCustomerId: "cus_test123",
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
    billingPortal: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://billing.stripe.com/session/test" }),
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

describe("CreatePortalSessionUseCase", () => {
  let useCase: CreatePortalSessionUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let stripeProvider: ReturnType<typeof makeStripeProvider>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    usersRepository = makeUsersRepository();
    stripeProvider = makeStripeProvider();
    useCase = new CreatePortalSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      stripeProvider as any,
    );
  });

  it("should create billing portal session and return URL", async () => {
    const result = await useCase.execute("personal-id-1");

    expect(stripeProvider.client.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: "cus_test123",
      return_url: "http://localhost:3000/assinatura",
    });
    expect(result).toEqual({ url: "https://billing.stripe.com/session/test" });
  });

  it("should throw BadRequestException when Stripe is not configured", async () => {
    stripeProvider = makeStripeProvider(false);
    useCase = new CreatePortalSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      stripeProvider as any,
    );

    await expect(useCase.execute("personal-id-1")).rejects.toThrow(BadRequestException);
  });

  it("should throw NotFoundException when personal is not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id")).rejects.toThrow(NotFoundException);
  });

  it("should lazily create Stripe customer when personal has no stripeCustomerId", async () => {
    personalsRepository = makePersonalsRepository(makePersonal({ stripeCustomerId: null }));
    useCase = new CreatePortalSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      stripeProvider as any,
    );

    const result = await useCase.execute("personal-id-1");

    expect(stripeProvider.client.customers.create).toHaveBeenCalledWith({
      email: "coach@example.com",
      name: "Coach Name",
      metadata: { userId: "user-id-1" },
    });
    expect(personalsRepository.updateSubscription).toHaveBeenCalledWith("personal-id-1", {
      stripeCustomerId: "cus_new123",
    });
    expect(stripeProvider.client.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: "cus_new123",
      return_url: "http://localhost:3000/assinatura",
    });
    expect(result).toEqual({ url: "https://billing.stripe.com/session/test" });
  });

  it("should throw NotFoundException when user is not found during lazy customer creation", async () => {
    personalsRepository = makePersonalsRepository(makePersonal({ stripeCustomerId: null }));
    usersRepository = makeUsersRepository();
    usersRepository.findById.mockResolvedValue(undefined);
    useCase = new CreatePortalSessionUseCase(
      personalsRepository as any,
      usersRepository as any,
      stripeProvider as any,
    );

    await expect(useCase.execute("personal-id-1")).rejects.toThrow(NotFoundException);
  });
});
