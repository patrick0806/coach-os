import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { SaveLpDraftUseCase } from "../saveLpDraft.useCase";

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
  findById: vi.fn().mockResolvedValue(makeProfile()),
  saveLpDraft: vi.fn().mockResolvedValue(undefined),
});

const makeS3Provider = () => ({
  deleteObject: vi.fn().mockResolvedValue(undefined),
});

describe("SaveLpDraftUseCase", () => {
  let useCase: SaveLpDraftUseCase;
  let repository: ReturnType<typeof makeRepository>;
  let s3Provider: ReturnType<typeof makeS3Provider>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    s3Provider = makeS3Provider();
    useCase = new SaveLpDraftUseCase(repository as any, s3Provider as any);
  });

  it("should save the LP draft successfully", async () => {
    await useCase.execute(tenantId, { lpTitle: "Meu Título", lpSubtitle: "Subtítulo" });

    expect(repository.saveLpDraft).toHaveBeenCalledWith(tenantId, {
      lpTitle: "Meu Título",
      lpSubtitle: "Subtítulo",
    });
  });

  it("should allow saving with layout only", async () => {
    await useCase.execute(tenantId, { lpLayout: "2" });

    expect(repository.saveLpDraft).toHaveBeenCalledWith(tenantId, { lpLayout: "2" });
  });

  it("should allow saving with valid image URLs", async () => {
    await useCase.execute(tenantId, {
      lpHeroImage: "https://example.com/image.jpg",
      lpImage1: "https://example.com/img1.jpg",
    });

    expect(repository.saveLpDraft).toHaveBeenCalledWith(tenantId, {
      lpHeroImage: "https://example.com/image.jpg",
      lpImage1: "https://example.com/img1.jpg",
    });
  });

  it("should throw ValidationException when lpLayout is invalid", async () => {
    await expect(useCase.execute(tenantId, { lpLayout: "5" })).rejects.toThrow();
  });

  it("should throw ValidationException when image URL is invalid", async () => {
    await expect(useCase.execute(tenantId, { lpHeroImage: "not-a-url" })).rejects.toThrow();
  });

  it("should throw NotFoundException when profile not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-tenant", { lpTitle: "Title" })).rejects.toThrow(
      NotFoundException,
    );
  });

  // S3 cleanup tests

  it("should delete old draft image when lpHeroImage is replaced", async () => {
    const oldUrl = "https://bucket.s3.region.amazonaws.com/lp/old-hero.jpg";
    const newUrl = "https://bucket.s3.region.amazonaws.com/lp/new-hero.jpg";
    repository.findById.mockResolvedValue(
      makeProfile({ lpDraftData: { lpHeroImage: oldUrl } }),
    );

    await useCase.execute(tenantId, { lpHeroImage: newUrl });

    expect(s3Provider.deleteObject).toHaveBeenCalledWith(oldUrl);
  });

  it("should not delete when no previous draft exists", async () => {
    repository.findById.mockResolvedValue(makeProfile({ lpDraftData: null }));

    await useCase.execute(tenantId, { lpHeroImage: "https://bucket.s3.region.amazonaws.com/new.jpg" });

    expect(s3Provider.deleteObject).not.toHaveBeenCalled();
  });

  it("should not delete when image field is not in payload", async () => {
    repository.findById.mockResolvedValue(
      makeProfile({ lpDraftData: { lpHeroImage: "https://bucket.s3.region.amazonaws.com/old.jpg" } }),
    );

    await useCase.execute(tenantId, { lpTitle: "New title" });

    expect(s3Provider.deleteObject).not.toHaveBeenCalled();
  });

  it("should not fail if S3 deletion throws", async () => {
    const oldUrl = "https://bucket.s3.region.amazonaws.com/lp/old-hero.jpg";
    const newUrl = "https://bucket.s3.region.amazonaws.com/lp/new-hero.jpg";
    repository.findById.mockResolvedValue(
      makeProfile({ lpDraftData: { lpHeroImage: oldUrl } }),
    );
    s3Provider.deleteObject.mockRejectedValue(new Error("S3 error"));

    await expect(useCase.execute(tenantId, { lpHeroImage: newUrl })).resolves.toBeUndefined();
  });
});
