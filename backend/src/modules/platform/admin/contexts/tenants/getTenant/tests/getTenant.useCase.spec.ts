import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { GetTenantUseCase } from "../getTenant.useCase";

const makePersonal = () => ({
  id: "personal-1",
  userId: "user-1",
  slug: "joao",
  accessStatus: "active",
  subscriptionPlanId: "plan-1",
  subscriptionStatus: "active",
  isWhitelisted: false,
  onboardingCompleted: true,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionExpiresAt: null,
  trialEndsAt: null,
  createdAt: new Date(),
});

const makeUser = () => ({ id: "user-1", name: "João", email: "joao@test.com" });

const makePersonalsRepository = (personal = makePersonal()) => ({
  findById: vi.fn().mockResolvedValue(personal),
});

const makeUsersRepository = (user = makeUser()) => ({
  findById: vi.fn().mockResolvedValue(user),
});

describe("GetTenantUseCase", () => {
  let useCase: GetTenantUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    usersRepository = makeUsersRepository();
    useCase = new GetTenantUseCase(personalsRepository as any, usersRepository as any);
  });

  it("should return tenant detail", async () => {
    const result = await useCase.execute("personal-1");
    expect(result.id).toBe("personal-1");
    expect(result.name).toBe("João");
    expect(result.email).toBe("joao@test.com");
  });

  it("should throw NotFoundException when personal not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);
    await expect(useCase.execute("personal-999")).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when user not found", async () => {
    usersRepository.findById.mockResolvedValue(undefined);
    await expect(useCase.execute("personal-1")).rejects.toThrow(NotFoundException);
  });
});
