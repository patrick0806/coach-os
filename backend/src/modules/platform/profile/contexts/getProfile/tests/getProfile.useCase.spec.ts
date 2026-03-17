import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetProfileUseCase } from "../getProfile.useCase";

const makeProfile = (overrides = {}) => ({
  id: "tenant-id-1",
  userId: "user-id-1",
  slug: "coach-joao",
  bio: "Treinador especialista",
  profilePhoto: null,
  logoUrl: null,
  themeColor: null,
  phoneNumber: null,
  specialties: [],
  onboardingCompleted: false,
  lpTitle: null,
  lpSubtitle: null,
  lpHeroImage: null,
  lpAboutTitle: null,
  lpAboutText: null,
  lpImage1: null,
  lpImage2: null,
  lpImage3: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: null,
  subscriptionPlanId: null,
  subscriptionExpiresAt: null,
  trialStartedAt: null,
  trialEndsAt: null,
  accessStatus: "active" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeProfile()),
});

describe("GetProfileUseCase", () => {
  let useCase: GetProfileUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new GetProfileUseCase(repository as any);
  });

  it("should return the coach profile", async () => {
    const result = await useCase.execute(tenantId);

    expect(result.id).toBe("tenant-id-1");
    expect(repository.findById).toHaveBeenCalledWith(tenantId);
  });

  it("should return profile with null optional fields", async () => {
    const result = await useCase.execute(tenantId);

    expect(result.bio).toBe("Treinador especialista");
    expect(result.profilePhoto).toBeNull();
  });

  it("should throw NotFoundException when profile not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-tenant")).rejects.toThrow(NotFoundException);
  });
});
