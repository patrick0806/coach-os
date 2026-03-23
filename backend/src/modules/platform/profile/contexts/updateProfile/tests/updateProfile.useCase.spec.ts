import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";

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
  findBySlug: vi.fn().mockResolvedValue(null),
  updateProfile: vi.fn().mockResolvedValue(makeProfile({ bio: "Updated bio" })),
});

const makeS3Provider = () => ({
  deleteObject: vi.fn().mockResolvedValue(undefined),
});

describe("UpdateProfileUseCase", () => {
  let useCase: UpdateProfileUseCase;
  let repository: ReturnType<typeof makeRepository>;
  let s3Provider: ReturnType<typeof makeS3Provider>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    s3Provider = makeS3Provider();
    useCase = new UpdateProfileUseCase(repository as any, s3Provider as any);
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

  // Slug update tests

  it("should update slug successfully when it is available", async () => {
    repository.findBySlug.mockResolvedValue(null);
    repository.updateProfile.mockResolvedValue(makeProfile({ slug: "new-slug" }));

    const result = await useCase.execute(tenantId, { slug: "new-slug" });

    expect(repository.findBySlug).toHaveBeenCalledWith("new-slug");
    expect(repository.updateProfile).toHaveBeenCalledWith(tenantId, { slug: "new-slug" });
    expect(result.slug).toBe("new-slug");
  });

  it("should throw ConflictException when slug is taken by another coach", async () => {
    repository.findBySlug.mockResolvedValue({
      ...makeProfile({ id: "other-tenant-id" }),
      coachName: "Other Coach",
    });

    await expect(useCase.execute(tenantId, { slug: "taken-slug" })).rejects.toThrow(
      ConflictException,
    );
  });

  it("should allow keeping the same slug (no conflict with self)", async () => {
    repository.findBySlug.mockResolvedValue({
      ...makeProfile(),
      coachName: "João Silva",
    });
    repository.updateProfile.mockResolvedValue(makeProfile());

    await expect(useCase.execute(tenantId, { slug: "coach-joao" })).resolves.toBeDefined();
  });

  it("should skip slug uniqueness check when slug is not being changed", async () => {
    await useCase.execute(tenantId, { bio: "Just bio" });

    expect(repository.findBySlug).not.toHaveBeenCalled();
  });

  it("should throw ValidationException for invalid slug format", async () => {
    await expect(useCase.execute(tenantId, { slug: "UPPERCASE" })).rejects.toThrow();
    await expect(useCase.execute(tenantId, { slug: "has spaces" })).rejects.toThrow();
    await expect(useCase.execute(tenantId, { slug: "special@chars" })).rejects.toThrow();
    await expect(useCase.execute(tenantId, { slug: "ab" })).rejects.toThrow(); // too short
  });

  it("should accept valid slug formats", async () => {
    repository.updateProfile.mockResolvedValue(makeProfile({ slug: "my-coach-123" }));

    await expect(useCase.execute(tenantId, { slug: "my-coach-123" })).resolves.toBeDefined();
    expect(repository.updateProfile).toHaveBeenCalledWith(tenantId, { slug: "my-coach-123" });
  });

  // S3 cleanup tests

  it("should delete old S3 object when profilePhoto is replaced", async () => {
    const oldUrl = "https://bucket.s3.region.amazonaws.com/profiles/old.jpg";
    const newUrl = "https://bucket.s3.region.amazonaws.com/profiles/new.jpg";
    repository.findById.mockResolvedValue(makeProfile({ profilePhoto: oldUrl }));
    repository.updateProfile.mockResolvedValue(makeProfile({ profilePhoto: newUrl }));

    await useCase.execute(tenantId, { profilePhoto: newUrl });

    expect(s3Provider.deleteObject).toHaveBeenCalledWith(oldUrl);
  });

  it("should delete old S3 object when logoUrl is replaced", async () => {
    const oldUrl = "https://bucket.s3.region.amazonaws.com/logos/old.png";
    const newUrl = "https://bucket.s3.region.amazonaws.com/logos/new.png";
    repository.findById.mockResolvedValue(makeProfile({ logoUrl: oldUrl }));
    repository.updateProfile.mockResolvedValue(makeProfile({ logoUrl: newUrl }));

    await useCase.execute(tenantId, { logoUrl: newUrl });

    expect(s3Provider.deleteObject).toHaveBeenCalledWith(oldUrl);
  });

  it("should not delete S3 when image field is not in payload", async () => {
    repository.findById.mockResolvedValue(
      makeProfile({ profilePhoto: "https://bucket.s3.region.amazonaws.com/old.jpg" }),
    );

    await useCase.execute(tenantId, { bio: "Just bio" });

    expect(s3Provider.deleteObject).not.toHaveBeenCalled();
  });

  it("should not delete S3 when existing image is null", async () => {
    repository.findById.mockResolvedValue(makeProfile({ profilePhoto: null }));

    await useCase.execute(tenantId, { profilePhoto: "https://bucket.s3.region.amazonaws.com/new.jpg" });

    expect(s3Provider.deleteObject).not.toHaveBeenCalled();
  });

  it("should not fail when S3 deletion throws", async () => {
    const oldUrl = "https://bucket.s3.region.amazonaws.com/profiles/old.jpg";
    const newUrl = "https://bucket.s3.region.amazonaws.com/profiles/new.jpg";
    repository.findById.mockResolvedValue(makeProfile({ profilePhoto: oldUrl }));
    repository.updateProfile.mockResolvedValue(makeProfile({ profilePhoto: newUrl }));
    s3Provider.deleteObject.mockRejectedValue(new Error("S3 error"));

    await expect(useCase.execute(tenantId, { profilePhoto: newUrl })).resolves.toBeDefined();
  });
});
