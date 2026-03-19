import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { PublishLpDraftUseCase } from "../publishLpDraft.useCase";

const makeProfile = (overrides = {}) => ({
  id: "tenant-id-1",
  userId: "user-id-1",
  slug: "coach-joao",
  bio: null,
  profilePhoto: null,
  logoUrl: null,
  themeColor: null,
  themeColorSecondary: null,
  phoneNumber: null,
  specialties: [],
  onboardingCompleted: false,
  isWhitelisted: false,
  lpLayout: "1",
  lpTitle: null,
  lpSubtitle: null,
  lpHeroImage: null,
  lpAboutTitle: null,
  lpAboutText: null,
  lpImage1: null,
  lpImage2: null,
  lpImage3: null,
  lpDraftData: null,
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
  findById: vi.fn().mockResolvedValue(
    makeProfile({ lpDraftData: { lpTitle: "Rascunho", lpLayout: "2" } }),
  ),
  publishLpDraft: vi.fn().mockResolvedValue(undefined),
});

describe("PublishLpDraftUseCase", () => {
  let useCase: PublishLpDraftUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new PublishLpDraftUseCase(repository as any);
  });

  it("should publish the LP draft successfully", async () => {
    await useCase.execute(tenantId);

    expect(repository.publishLpDraft).toHaveBeenCalledWith(tenantId);
  });

  it("should throw BadRequestException when there is no draft to publish", async () => {
    repository.findById.mockResolvedValue(makeProfile({ lpDraftData: null }));

    await expect(useCase.execute(tenantId)).rejects.toThrow(BadRequestException);
  });

  it("should throw NotFoundException when profile not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-tenant")).rejects.toThrow(NotFoundException);
  });
});
