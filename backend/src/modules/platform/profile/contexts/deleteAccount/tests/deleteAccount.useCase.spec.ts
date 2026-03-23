import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteAccountUseCase } from "../deleteAccount.useCase";

const makePersonal = (overrides = {}) => ({
  id: "tenant-id-1",
  userId: "user-id-1",
  slug: "coach-joao",
  bio: null,
  profilePhoto: "https://bucket.s3.region.amazonaws.com/profiles/photo.jpg",
  logoUrl: "https://bucket.s3.region.amazonaws.com/logos/logo.png",
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
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  subscriptionStatus: "active",
  subscriptionPlanId: null,
  subscriptionExpiresAt: null,
  trialStartedAt: null,
  trialEndsAt: null,
  accessStatus: "active" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePersonalsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makePersonal()),
});

const makeUsersRepository = () => ({
  deleteById: vi.fn().mockResolvedValue(undefined),
});

const makeStripeProvider = () => ({
  isConfigured: vi.fn().mockReturnValue(true),
  client: {
    subscriptions: {
      cancel: vi.fn().mockResolvedValue({}),
    },
  },
});

const makeS3Provider = () => ({
  deleteObject: vi.fn().mockResolvedValue(undefined),
});

const makeTxDelete = () => vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

const makeDrizzle = () => {
  const txDelete = makeTxDelete();
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
      transaction: vi.fn().mockImplementation(async (cb: (tx: any) => Promise<void>) => {
        await cb({ delete: txDelete });
      }),
    },
    txDelete,
  };
};

describe("DeleteAccountUseCase", () => {
  let useCase: DeleteAccountUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let stripeProvider: ReturnType<typeof makeStripeProvider>;
  let s3Provider: ReturnType<typeof makeS3Provider>;
  let drizzle: ReturnType<typeof makeDrizzle>;

  const personalId = "tenant-id-1";
  const userId = "user-id-1";

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    usersRepository = makeUsersRepository();
    stripeProvider = makeStripeProvider();
    s3Provider = makeS3Provider();
    drizzle = makeDrizzle();
    useCase = new DeleteAccountUseCase(
      personalsRepository as any,
      usersRepository as any,
      stripeProvider as any,
      s3Provider as any,
      drizzle as any,
    );
  });

  it("should delete account successfully", async () => {
    await useCase.execute(personalId, userId);

    expect(stripeProvider.client.subscriptions.cancel).toHaveBeenCalledWith("sub_123");
    expect(drizzle.db.transaction).toHaveBeenCalledOnce();
    expect(usersRepository.deleteById).toHaveBeenCalledWith(userId);
  });

  it("should throw NotFoundException when profile not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(personalId, userId)).rejects.toThrow(NotFoundException);
  });

  it("should cancel Stripe subscription immediately", async () => {
    await useCase.execute(personalId, userId);

    expect(stripeProvider.client.subscriptions.cancel).toHaveBeenCalledWith("sub_123");
  });

  it("should skip Stripe cancellation when no subscription exists", async () => {
    personalsRepository.findById.mockResolvedValue(makePersonal({ stripeSubscriptionId: null }));

    await useCase.execute(personalId, userId);

    expect(stripeProvider.client.subscriptions.cancel).not.toHaveBeenCalled();
  });

  it("should skip Stripe cancellation when Stripe is not configured", async () => {
    stripeProvider.isConfigured.mockReturnValue(false);

    await useCase.execute(personalId, userId);

    expect(stripeProvider.client.subscriptions.cancel).not.toHaveBeenCalled();
  });

  it("should not fail when Stripe cancellation throws", async () => {
    stripeProvider.client.subscriptions.cancel.mockRejectedValue(new Error("Stripe error"));

    await expect(useCase.execute(personalId, userId)).resolves.toBeUndefined();
    expect(usersRepository.deleteById).toHaveBeenCalledWith(userId);
  });

  it("should delete tenant data in a transaction", async () => {
    await useCase.execute(personalId, userId);

    expect(drizzle.db.transaction).toHaveBeenCalledOnce();
    // Transaction should call delete multiple times for all tenant tables
    expect(drizzle.txDelete).toHaveBeenCalled();
  });

  it("should delete user after tenant data cleanup", async () => {
    const callOrder: string[] = [];
    drizzle.db.transaction.mockImplementation(async (cb: any) => {
      await cb({ delete: makeTxDelete() });
      callOrder.push("transaction");
    });
    usersRepository.deleteById.mockImplementation(async () => {
      callOrder.push("deleteUser");
    });

    await useCase.execute(personalId, userId);

    expect(callOrder).toEqual(["transaction", "deleteUser"]);
  });

  it("should attempt S3 cleanup for profile images", async () => {
    await useCase.execute(personalId, userId);

    // Profile photo and logo from makePersonal()
    expect(s3Provider.deleteObject).toHaveBeenCalledWith(
      "https://bucket.s3.region.amazonaws.com/profiles/photo.jpg",
    );
    expect(s3Provider.deleteObject).toHaveBeenCalledWith(
      "https://bucket.s3.region.amazonaws.com/logos/logo.png",
    );
  });

  it("should not fail when S3 cleanup throws", async () => {
    s3Provider.deleteObject.mockRejectedValue(new Error("S3 error"));

    await expect(useCase.execute(personalId, userId)).resolves.toBeUndefined();
  });
});
