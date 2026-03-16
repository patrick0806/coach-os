import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { RegisterUseCase } from "../register.useCase";

const makeUser = (overrides = {}) => ({
  id: "user-id",
  name: "João Silva",
  email: "joao@email.com",
  password: "hashed_password",
  isActive: true,
  role: "PERSONAL",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePersonal = (overrides = {}) => ({
  id: "personal-id",
  userId: "user-id",
  slug: "joao-silva",
  accessStatus: "trialing",
  subscriptionPlanId: PLAN_ID,
  trialStartedAt: new Date(),
  trialEndsAt: new Date(),
  ...overrides,
});

const PLAN_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const makePlan = (overrides = {}) => ({
  id: PLAN_ID,
  name: "Básico",
  price: "29.90",
  maxStudents: 10,
  isDefault: true,
  isActive: true,
  stripePriceId: null,
  ...overrides,
});

const makeJwtService = () => ({
  sign: vi.fn().mockReturnValue("access.token.here"),
});

const makeUsersRepository = () => ({
  findByEmail: vi.fn().mockResolvedValue(undefined),
  create: vi.fn().mockResolvedValue(makeUser()),
  updateRefreshTokenHash: vi.fn().mockResolvedValue(undefined),
});

const makePlansRepository = () => ({
  findById: vi.fn().mockResolvedValue(makePlan()),
  findDefault: vi.fn().mockResolvedValue(makePlan()),
});

const makePersonalsRepository = () => ({
  findBySlug: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue(makePersonal()),
});

const makeStripeProvider = () => ({
  isConfigured: vi.fn().mockReturnValue(false),
  client: null,
});

describe("RegisterUseCase", () => {
  let useCase: RegisterUseCase;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let jwtService: ReturnType<typeof makeJwtService>;
  let stripeProvider: ReturnType<typeof makeStripeProvider>;

  beforeEach(() => {
    usersRepository = makeUsersRepository();
    plansRepository = makePlansRepository();
    personalsRepository = makePersonalsRepository();
    jwtService = makeJwtService();
    stripeProvider = makeStripeProvider();

    useCase = new RegisterUseCase(
      usersRepository as any,
      personalsRepository as any,
      plansRepository as any,
      jwtService as any,
      stripeProvider as any,
    );
  });

  it("should register with default plan when planId is not provided", async () => {
    const result = await useCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    expect(plansRepository.findDefault).toHaveBeenCalled();
    expect(plansRepository.findById).not.toHaveBeenCalled();
    expect(result.accessToken).toBe("access.token.here");
    expect(result.user.email).toBe("joao@email.com");
    expect(result.personal.slug).toBe("joao-silva");
  });

  it("should register with explicit planId when provided", async () => {
    const result = await useCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "Str0ngPass!",
      planId: PLAN_ID,
    });

    expect(plansRepository.findById).toHaveBeenCalledWith(PLAN_ID);
    expect(plansRepository.findDefault).not.toHaveBeenCalled();
    expect(result.accessToken).toBeDefined();
  });

  it("should throw ConflictException when email already exists", async () => {
    usersRepository.findByEmail.mockResolvedValue(makeUser());

    await expect(
      useCase.execute({
        name: "João Silva",
        email: "joao@email.com",
        password: "Str0ngPass!",
      }),
    ).rejects.toThrow(ConflictException);
  });

  it("should throw NotFoundException when planId is not found", async () => {
    plansRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        name: "João Silva",
        email: "joao@email.com",
        password: "Str0ngPass!",
        planId: "00000000-0000-0000-0000-000000000000",
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when no default plan exists", async () => {
    plansRepository.findDefault.mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        name: "João Silva",
        email: "joao@email.com",
        password: "Str0ngPass!",
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when email is invalid", async () => {
    await expect(
      useCase.execute({
        name: "João Silva",
        email: "not-an-email",
        password: "Str0ngPass!",
      }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should throw ValidationException when password is too short", async () => {
    await expect(
      useCase.execute({
        name: "João Silva",
        email: "joao@email.com",
        password: "short",
      }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should throw ValidationException when name is too short", async () => {
    await expect(
      useCase.execute({
        name: "Jo",
        email: "joao@email.com",
        password: "Str0ngPass!",
      }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should not store password in plaintext", async () => {
    await useCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    const createdWith = usersRepository.create.mock.calls[0][0];
    expect(createdWith.password).not.toBe("Str0ngPass!");
    expect(createdWith.password.length).toBeGreaterThan(20);
  });

  it("should store refresh token hash in users table (not the raw token)", async () => {
    const result = await useCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    expect(usersRepository.updateRefreshTokenHash).toHaveBeenCalledOnce();
    const [, storedHash] = usersRepository.updateRefreshTokenHash.mock.calls[0];
    expect(storedHash).not.toBe(result.refreshToken);
    expect(storedHash).toHaveLength(64); // SHA-256 hex
  });

  it("should set trialing status when Stripe is not configured", async () => {
    await useCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    const createdWith = personalsRepository.create.mock.calls[0][0];
    expect(createdWith.accessStatus).toBe("trialing");
    expect(createdWith.trialStartedAt).toBeDefined();
    expect(createdWith.trialEndsAt).toBeDefined();
  });

  it("should create Stripe customer and subscription when plan has stripePriceId and Stripe is configured", async () => {
    const stripeClient = {
      customers: { create: vi.fn().mockResolvedValue({ id: "cus_123" }) },
      subscriptions: {
        create: vi.fn().mockResolvedValue({ id: "sub_123", status: "trialing" }),
      },
    };
    stripeProvider.isConfigured.mockReturnValue(true);
    stripeProvider.client = stripeClient as any;
    plansRepository.findDefault.mockResolvedValue(makePlan({ stripePriceId: "price_abc" }));

    await useCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    expect(stripeClient.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "joao@email.com" }),
    );
    expect(stripeClient.subscriptions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_123" }),
    );
    const createdWith = personalsRepository.create.mock.calls[0][0];
    expect(createdWith.stripeCustomerId).toBe("cus_123");
    expect(createdWith.stripeSubscriptionId).toBe("sub_123");
  });

  it("should handle slug collision by appending counter", async () => {
    personalsRepository.findBySlug
      .mockResolvedValueOnce({ slug: "joao-silva" })
      .mockResolvedValueOnce(null);

    await useCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    const createdWith = personalsRepository.create.mock.calls[0][0];
    expect(createdWith.slug).toBe("joao-silva-2");
  });

  it("should build correct JWT payload", async () => {
    await useCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        role: ApplicationRoles.PERSONAL,
        personalId: "personal-id",
        profileId: "personal-id",
        personalSlug: "joao-silva",
      }),
    );
  });

  it("should return user and personal data in result", async () => {
    const result = await useCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    expect(result.user).toMatchObject({
      id: "user-id",
      name: "João Silva",
      email: "joao@email.com",
      role: "PERSONAL",
    });
    expect(result.personal).toMatchObject({
      id: "personal-id",
      slug: "joao-silva",
    });
    expect(result.refreshToken).toBeDefined();
    expect(typeof result.refreshToken).toBe("string");
    expect(result.refreshToken.length).toBeGreaterThan(20);
  });
});
