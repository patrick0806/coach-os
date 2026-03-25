import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AcceptCoachInviteUseCase } from "../acceptCoachInvite.useCase";

const makePlan = () => ({ id: "plan-1", name: "Pro" });

const makeActiveToken = (overrides: Record<string, unknown> = {}) => ({
  id: "token-1",
  name: "Coach Teste",
  email: "coach@test.com",
  planId: "plan-1",
  isWhitelisted: false,
  tokenHash: "hashed",
  expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  usedAt: null,
  createdAt: new Date(),
  ...overrides,
});

const makeCoachInvitationTokensRepository = (token: unknown = makeActiveToken()) => ({
  findByTokenHash: vi.fn().mockResolvedValue(token),
  markAsUsed: vi.fn().mockResolvedValue(undefined),
});

const makeUsersRepository = (user: unknown = null) => ({
  findByEmail: vi.fn().mockResolvedValue(user),
  create: vi.fn().mockResolvedValue({ id: "user-1" }),
});

const makePlansRepository = (plan: unknown = makePlan()) => ({
  findById: vi.fn().mockResolvedValue(plan),
});

const makePersonalsRepository = () => ({
  create: vi.fn().mockResolvedValue({ id: "personal-1", slug: "coach-teste" }),
  findBySlug: vi.fn().mockResolvedValue(undefined),
});

const makeDrizzle = () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<void>) => fn({})),
  },
});

describe("AcceptCoachInviteUseCase", () => {
  let useCase: AcceptCoachInviteUseCase;
  let coachInvitationTokensRepository: ReturnType<typeof makeCoachInvitationTokensRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let drizzle: ReturnType<typeof makeDrizzle>;

  const validBody = {
    token: "raw-token",
    password: "password123",
  };

  beforeEach(() => {
    coachInvitationTokensRepository = makeCoachInvitationTokensRepository();
    usersRepository = makeUsersRepository();
    plansRepository = makePlansRepository();
    personalsRepository = makePersonalsRepository();
    drizzle = makeDrizzle();
    useCase = new AcceptCoachInviteUseCase(
      coachInvitationTokensRepository as any,
      usersRepository as any,
      plansRepository as any,
      personalsRepository as any,
      drizzle as any,
    );
  });

  it("should create a trialing coach when isWhitelisted=false", async () => {
    const result = await useCase.execute(validBody);
    expect(result).toEqual({ message: "Conta criada com sucesso" });
    expect(usersRepository.create).toHaveBeenCalled();
    expect(personalsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accessStatus: "trialing",
        isWhitelisted: false,
      }),
      expect.anything(),
    );
  });

  it("should create an active whitelisted coach when isWhitelisted=true", async () => {
    coachInvitationTokensRepository.findByTokenHash.mockResolvedValue(
      makeActiveToken({ isWhitelisted: true }),
    );
    await useCase.execute(validBody);
    expect(personalsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accessStatus: "active",
        isWhitelisted: true,
      }),
      expect.anything(),
    );
  });

  it("should not set trial dates for whitelisted coach", async () => {
    coachInvitationTokensRepository.findByTokenHash.mockResolvedValue(
      makeActiveToken({ isWhitelisted: true }),
    );
    await useCase.execute(validBody);
    const createCall = personalsRepository.create.mock.calls[0][0];
    expect(createCall.trialStartedAt).toBeUndefined();
    expect(createCall.trialEndsAt).toBeUndefined();
  });

  it("should set trial dates for non-whitelisted coach", async () => {
    await useCase.execute(validBody);
    const createCall = personalsRepository.create.mock.calls[0][0];
    expect(createCall.trialStartedAt).toBeInstanceOf(Date);
    expect(createCall.trialEndsAt).toBeInstanceOf(Date);
  });

  it("should mark token as used after account creation", async () => {
    await useCase.execute(validBody);
    expect(coachInvitationTokensRepository.markAsUsed).toHaveBeenCalledWith("token-1", expect.anything());
  });

  it("should throw UnauthorizedException when token is not found", async () => {
    coachInvitationTokensRepository.findByTokenHash.mockResolvedValue(undefined);
    await expect(useCase.execute(validBody)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when token is already used", async () => {
    coachInvitationTokensRepository.findByTokenHash.mockResolvedValue(
      makeActiveToken({ usedAt: new Date() }),
    );
    await expect(useCase.execute(validBody)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when token is expired", async () => {
    coachInvitationTokensRepository.findByTokenHash.mockResolvedValue(
      makeActiveToken({ expiresAt: new Date(Date.now() - 1000) }),
    );
    await expect(useCase.execute(validBody)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw ConflictException when email is already registered", async () => {
    usersRepository.findByEmail.mockResolvedValue({ id: "user-existing" });
    await expect(useCase.execute(validBody)).rejects.toThrow(ConflictException);
  });

  it("should throw NotFoundException when plan is not found", async () => {
    plansRepository.findById.mockResolvedValue(undefined);
    await expect(useCase.execute(validBody)).rejects.toThrow(NotFoundException);
  });
});
