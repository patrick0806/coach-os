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

const makeS3Provider = () => ({
  deleteObject: vi.fn().mockResolvedValue(undefined),
});

describe("PublishLpDraftUseCase", () => {
  let useCase: PublishLpDraftUseCase;
  let repository: ReturnType<typeof makeRepository>;
  let s3Provider: ReturnType<typeof makeS3Provider>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    s3Provider = makeS3Provider();
    useCase = new PublishLpDraftUseCase(repository as any, s3Provider as any);
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

  // S3 cleanup tests

  it("should delete old live image when draft has different image", async () => {
    const liveUrl = "https://bucket.s3.region.amazonaws.com/lp/live-hero.jpg";
    const draftUrl = "https://bucket.s3.region.amazonaws.com/lp/draft-hero.jpg";
    repository.findById.mockResolvedValue(
      makeProfile({
        lpHeroImage: liveUrl,
        lpDraftData: { lpTitle: "Draft", lpHeroImage: draftUrl },
      }),
    );

    await useCase.execute(tenantId);

    expect(s3Provider.deleteObject).toHaveBeenCalledWith(liveUrl);
  });

  it("should not delete when draft image matches live image", async () => {
    const sameUrl = "https://bucket.s3.region.amazonaws.com/lp/same.jpg";
    repository.findById.mockResolvedValue(
      makeProfile({
        lpHeroImage: sameUrl,
        lpDraftData: { lpTitle: "Draft", lpHeroImage: sameUrl },
      }),
    );

    await useCase.execute(tenantId);

    expect(s3Provider.deleteObject).not.toHaveBeenCalled();
  });

  it("should not delete when live image is null", async () => {
    repository.findById.mockResolvedValue(
      makeProfile({
        lpHeroImage: null,
        lpDraftData: { lpTitle: "Draft", lpHeroImage: "https://bucket.s3.region.amazonaws.com/new.jpg" },
      }),
    );

    await useCase.execute(tenantId);

    expect(s3Provider.deleteObject).not.toHaveBeenCalled();
  });

  it("should handle multiple image fields being replaced", async () => {
    repository.findById.mockResolvedValue(
      makeProfile({
        lpHeroImage: "https://bucket.s3.region.amazonaws.com/lp/old-hero.jpg",
        lpImage1: "https://bucket.s3.region.amazonaws.com/lp/old-img1.jpg",
        lpImage2: null,
        lpDraftData: {
          lpHeroImage: "https://bucket.s3.region.amazonaws.com/lp/new-hero.jpg",
          lpImage1: "https://bucket.s3.region.amazonaws.com/lp/new-img1.jpg",
          lpImage2: "https://bucket.s3.region.amazonaws.com/lp/new-img2.jpg",
        },
      }),
    );

    await useCase.execute(tenantId);

    expect(s3Provider.deleteObject).toHaveBeenCalledTimes(2);
    expect(s3Provider.deleteObject).toHaveBeenCalledWith("https://bucket.s3.region.amazonaws.com/lp/old-hero.jpg");
    expect(s3Provider.deleteObject).toHaveBeenCalledWith("https://bucket.s3.region.amazonaws.com/lp/old-img1.jpg");
  });

  it("should not fail if S3 deletion throws", async () => {
    repository.findById.mockResolvedValue(
      makeProfile({
        lpHeroImage: "https://bucket.s3.region.amazonaws.com/lp/old.jpg",
        lpDraftData: { lpHeroImage: "https://bucket.s3.region.amazonaws.com/lp/new.jpg" },
      }),
    );
    s3Provider.deleteObject.mockRejectedValue(new Error("S3 error"));

    await expect(useCase.execute(tenantId)).resolves.toBeUndefined();
  });
});
