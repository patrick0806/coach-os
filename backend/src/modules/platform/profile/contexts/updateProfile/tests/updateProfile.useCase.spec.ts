import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateProfileUseCase } from "../updateProfile.useCase";

const makeProfile = (overrides = {}) => ({
  id: "tenant-id-1",
  userId: "user-id-1",
  slug: "coach-joao",
  bio: null,
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
  updateProfile: vi.fn().mockResolvedValue(makeProfile({ bio: "Updated bio" })),
});

describe("UpdateProfileUseCase", () => {
  let useCase: UpdateProfileUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new UpdateProfileUseCase(repository as any);
  });

  it("should update the profile successfully", async () => {
    const result = await useCase.execute(tenantId, { bio: "Updated bio" });

    expect(result.bio).toBe("Updated bio");
    expect(repository.updateProfile).toHaveBeenCalledWith(tenantId, { bio: "Updated bio" });
  });

  it("should allow partial updates", async () => {
    await useCase.execute(tenantId, { phoneNumber: "+55 11 99999-9999" });

    expect(repository.updateProfile).toHaveBeenCalledWith(tenantId, {
      phoneNumber: "+55 11 99999-9999",
    });
  });

  it("should throw ValidationException when themeColor is invalid", async () => {
    await expect(useCase.execute(tenantId, { themeColor: "invalid-color" })).rejects.toThrow();
  });

  it("should throw ValidationException when profilePhoto is not a URL", async () => {
    await expect(useCase.execute(tenantId, { profilePhoto: "not-a-url" })).rejects.toThrow();
  });

  it("should throw NotFoundException when profile not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-tenant", { bio: "Bio" })).rejects.toThrow(
      NotFoundException,
    );
  });
});
