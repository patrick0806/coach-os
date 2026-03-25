import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { InviteCoachUseCase } from "../inviteCoach.useCase";

const PLAN_UUID = "550e8400-e29b-41d4-a716-446655440000";

const makePlan = () => ({ id: PLAN_UUID, name: "Pro" });

const makeUsersRepository = (user: unknown = null) => ({
  findByEmail: vi.fn().mockResolvedValue(user),
});

const makePlansRepository = (plan: unknown = makePlan()) => ({
  findById: vi.fn().mockResolvedValue(plan),
});

const makeCoachInvitationTokensRepository = () => ({
  invalidateByEmail: vi.fn().mockResolvedValue(undefined),
  create: vi.fn().mockResolvedValue({ id: "token-1" }),
});

const makeResendProvider = () => ({
  sendCoachInvite: vi.fn().mockResolvedValue(undefined),
});

describe("InviteCoachUseCase", () => {
  let useCase: InviteCoachUseCase;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let coachInvitationTokensRepository: ReturnType<typeof makeCoachInvitationTokensRepository>;
  let resendProvider: ReturnType<typeof makeResendProvider>;

  const validBody = {
    name: "Coach Teste",
    email: "coach@test.com",
    planId: PLAN_UUID,
    isWhitelisted: false,
  };

  beforeEach(() => {
    usersRepository = makeUsersRepository();
    plansRepository = makePlansRepository();
    coachInvitationTokensRepository = makeCoachInvitationTokensRepository();
    resendProvider = makeResendProvider();
    useCase = new InviteCoachUseCase(
      usersRepository as any,
      plansRepository as any,
      coachInvitationTokensRepository as any,
      resendProvider as any,
    );
  });

  it("should create a token and send invite email", async () => {
    const result = await useCase.execute(validBody);
    expect(result).toEqual({ message: "Invitation sent successfully" });
    expect(coachInvitationTokensRepository.invalidateByEmail).toHaveBeenCalledWith("coach@test.com");
    expect(coachInvitationTokensRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Coach Teste",
        email: "coach@test.com",
        planId: PLAN_UUID,
        isWhitelisted: false,
      }),
    );
    expect(resendProvider.sendCoachInvite).toHaveBeenCalledWith(
      expect.objectContaining({ to: "coach@test.com", coachName: "Coach Teste" }),
    );
  });

  it("should send invite with isWhitelisted=true when requested", async () => {
    await useCase.execute({ ...validBody, isWhitelisted: true });
    expect(coachInvitationTokensRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ isWhitelisted: true }),
    );
  });

  it("should invalidate previous tokens before creating a new one", async () => {
    await useCase.execute(validBody);
    const invalidateOrder = coachInvitationTokensRepository.invalidateByEmail.mock.invocationCallOrder[0];
    const createOrder = coachInvitationTokensRepository.create.mock.invocationCallOrder[0];
    expect(invalidateOrder).toBeLessThan(createOrder);
  });

  it("should throw ConflictException when email is already registered", async () => {
    usersRepository.findByEmail.mockResolvedValue({ id: "user-1", email: "coach@test.com" });
    await expect(useCase.execute(validBody)).rejects.toThrow(ConflictException);
  });

  it("should throw NotFoundException when plan is not found", async () => {
    plansRepository.findById.mockResolvedValue(undefined);
    await expect(useCase.execute(validBody)).rejects.toThrow(NotFoundException);
  });
});
