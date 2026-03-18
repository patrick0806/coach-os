import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetPublicProfileUseCase } from "../getPublicProfile.useCase";

const makePersonal = (overrides = {}) => ({
  id: "tenant-id-1",
  userId: "user-id-1",
  slug: "coach-joao",
  coachName: "João Silva",
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

const makeAvailabilityRule = (overrides = {}) => ({
  id: "rule-id-1",
  tenantId: "tenant-id-1",
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "12:00",
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

const makeTrainingSchedule = (overrides = {}) => ({
  id: "schedule-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  studentProgramId: null,
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "09:00",
  location: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeAvailabilityRulesRepository = () => ({
  findByTenantId: vi.fn().mockResolvedValue([makeAvailabilityRule()]),
});

const makeTrainingSchedulesRepository = () => ({
  findByTenantId: vi.fn().mockResolvedValue([makeTrainingSchedule()]),
});

describe("GetPublicProfileUseCase", () => {
  let useCase: GetPublicProfileUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let servicePlansRepository: ReturnType<typeof makeServicePlansRepository>;
  let availabilityRulesRepository: ReturnType<typeof makeAvailabilityRulesRepository>;
  let trainingSchedulesRepository: ReturnType<typeof makeTrainingSchedulesRepository>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    servicePlansRepository = makeServicePlansRepository();
    availabilityRulesRepository = makeAvailabilityRulesRepository();
    trainingSchedulesRepository = makeTrainingSchedulesRepository();
    useCase = new GetPublicProfileUseCase(
      personalsRepository as any,
      servicePlansRepository as any,
      availabilityRulesRepository as any,
      trainingSchedulesRepository as any,
    );
  });

  it("should return public profile with coach data", async () => {
    const result = await useCase.execute("coach-joao");

    expect(result.slug).toBe("coach-joao");
    expect(result.coachName).toBe("João Silva");
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

  it("should include availability rules in response", async () => {
    const result = await useCase.execute("coach-joao");

    expect(result.availabilityRules).toHaveLength(1);
    expect(result.availabilityRules[0].id).toBe("rule-id-1");
    expect(availabilityRulesRepository.findByTenantId).toHaveBeenCalledWith("tenant-id-1");
  });

  it("should return empty array when there are no availability rules", async () => {
    availabilityRulesRepository.findByTenantId.mockResolvedValue([]);

    const result = await useCase.execute("coach-joao");

    expect(result.availabilityRules).toHaveLength(0);
  });

  it("should include occupied slots from active training schedules", async () => {
    const result = await useCase.execute("coach-joao");

    expect(result.occupiedSlots).toHaveLength(1);
    expect(result.occupiedSlots[0]).toEqual({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "09:00",
    });
    expect(trainingSchedulesRepository.findByTenantId).toHaveBeenCalledWith("tenant-id-1");
  });

  it("should return empty occupiedSlots when there are no training schedules", async () => {
    trainingSchedulesRepository.findByTenantId.mockResolvedValue([]);

    const result = await useCase.execute("coach-joao");

    expect(result.occupiedSlots).toHaveLength(0);
  });
});
