import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetPublicProfileUseCase } from "../getPublicProfile.useCase";

const makePersonal = (overrides = {}) => ({
  id: "tenant-id-1",
  userId: "user-id-1",
  slug: "coach-joao",
  bio: "Treinador especialista",
  profilePhoto: "https://example.com/photo.jpg",
  logoUrl: null,
  themeColor: "#FF5733",
  phoneNumber: "+55 11 99999-9999",
  specialties: ["musculação", "emagrecimento"],
  onboardingCompleted: true,
  lpTitle: "Transforme seu corpo",
  lpSubtitle: "Treinamento personalizado",
  lpHeroImage: null,
  lpAboutTitle: "Sobre mim",
  lpAboutText: "Sou personal trainer...",
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

const makeServicePlan = (overrides = {}) => ({
  id: "plan-id-1",
  tenantId: "tenant-id-1",
  name: "Consultoria Online",
  description: null,
  price: "49.90",
  sessionsPerWeek: 3,
  durationMinutes: 60,
  attendanceType: "online" as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePersonalsRepository = () => ({
  findBySlug: vi.fn().mockResolvedValue(makePersonal()),
});

const makeServicePlansRepository = () => ({
  findActiveByTenantId: vi.fn().mockResolvedValue([makeServicePlan()]),
});

describe("GetPublicProfileUseCase", () => {
  let useCase: GetPublicProfileUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let servicePlansRepository: ReturnType<typeof makeServicePlansRepository>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    servicePlansRepository = makeServicePlansRepository();
    useCase = new GetPublicProfileUseCase(personalsRepository as any, servicePlansRepository as any);
  });

  it("should return public profile with coach data", async () => {
    const result = await useCase.execute("coach-joao");

    expect(result.slug).toBe("coach-joao");
    expect(result.bio).toBe("Treinador especialista");
    expect(result.themeColor).toBe("#FF5733");
    expect(personalsRepository.findBySlug).toHaveBeenCalledWith("coach-joao");
  });

  it("should throw NotFoundException when slug not found", async () => {
    personalsRepository.findBySlug.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-slug")).rejects.toThrow(NotFoundException);
  });

  it("should include active service plans in response", async () => {
    const result = await useCase.execute("coach-joao");

    expect(result.servicePlans).toHaveLength(1);
    expect(result.servicePlans[0].id).toBe("plan-id-1");
    expect(servicePlansRepository.findActiveByTenantId).toHaveBeenCalledWith("tenant-id-1");
  });

  it("should exclude inactive service plans", async () => {
    servicePlansRepository.findActiveByTenantId.mockResolvedValue([]);

    const result = await useCase.execute("coach-joao");

    expect(result.servicePlans).toHaveLength(0);
  });
});
