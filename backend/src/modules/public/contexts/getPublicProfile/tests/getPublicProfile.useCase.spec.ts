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
  themeColorSecondary: null,
  lpLayout: "1",
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

const makeWorkingHours = (overrides = {}) => ({
  id: "wh-id-1",
  tenantId: "tenant-id-1",
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "12:00",
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRecurringSlot = (overrides = {}) => ({
  id: "slot-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  studentProgramId: null,
  type: "booking" as const,
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "09:00",
  location: null,
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
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

const makeWorkingHoursRepository = () => ({
  findActiveByTenant: vi.fn().mockResolvedValue([makeWorkingHours()]),
});

const makeRecurringSlotsRepository = () => ({
  findByTenantId: vi.fn().mockResolvedValue([makeRecurringSlot()]),
});

describe("GetPublicProfileUseCase", () => {
  let useCase: GetPublicProfileUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let servicePlansRepository: ReturnType<typeof makeServicePlansRepository>;
  let workingHoursRepository: ReturnType<typeof makeWorkingHoursRepository>;
  let recurringSlotsRepository: ReturnType<typeof makeRecurringSlotsRepository>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    servicePlansRepository = makeServicePlansRepository();
    workingHoursRepository = makeWorkingHoursRepository();
    recurringSlotsRepository = makeRecurringSlotsRepository();
    useCase = new GetPublicProfileUseCase(
      personalsRepository as any,
      servicePlansRepository as any,
      workingHoursRepository as any,
      recurringSlotsRepository as any,
    );
  });

  it("should return public profile with coach data", async () => {
    const result = await useCase.execute("coach-joao");

    expect(result.slug).toBe("coach-joao");
    expect(result.coachName).toBe("João Silva");
    expect(result.bio).toBe("Treinador especialista");
    expect(result.themeColor).toBe("#FF5733");
    expect(result.logoUrl).toBeNull();
    expect(personalsRepository.findBySlug).toHaveBeenCalledWith("coach-joao");
  });

  it("should include logoUrl when coach has a logo", async () => {
    personalsRepository.findBySlug.mockResolvedValue(
      makePersonal({ logoUrl: "https://example.com/logo.png" }),
    );

    const result = await useCase.execute("coach-joao");

    expect(result.logoUrl).toBe("https://example.com/logo.png");
  });

  it("should include specialties in response", async () => {
    const result = await useCase.execute("coach-joao");

    expect(result.specialties).toEqual(["musculação", "emagrecimento"]);
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

  it("should include working hours in response", async () => {
    const result = await useCase.execute("coach-joao");

    expect(result.workingHours).toHaveLength(1);
    expect(result.workingHours[0].id).toBe("wh-id-1");
    expect(workingHoursRepository.findActiveByTenant).toHaveBeenCalledWith("tenant-id-1");
  });

  it("should return empty array when there are no working hours", async () => {
    workingHoursRepository.findActiveByTenant.mockResolvedValue([]);

    const result = await useCase.execute("coach-joao");

    expect(result.workingHours).toHaveLength(0);
  });

  it("should include occupied slots from active recurring slots", async () => {
    const result = await useCase.execute("coach-joao");

    expect(result.occupiedSlots).toHaveLength(1);
    expect(result.occupiedSlots[0]).toEqual({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "09:00",
    });
    expect(recurringSlotsRepository.findByTenantId).toHaveBeenCalledWith("tenant-id-1");
  });

  it("should return empty occupiedSlots when there are no recurring slots", async () => {
    recurringSlotsRepository.findByTenantId.mockResolvedValue([]);

    const result = await useCase.execute("coach-joao");

    expect(result.occupiedSlots).toHaveLength(0);
  });

  it("should include lpLayout and themeColorSecondary in response", async () => {
    personalsRepository.findBySlug.mockResolvedValue(
      makePersonal({ lpLayout: "2", themeColorSecondary: "#a855f7" }),
    );

    const result = await useCase.execute("coach-joao");

    expect(result.lpLayout).toBe("2");
    expect(result.themeColorSecondary).toBe("#a855f7");
  });

  it("should default lpLayout to '1' when not set", async () => {
    personalsRepository.findBySlug.mockResolvedValue(
      makePersonal({ lpLayout: null }),
    );

    const result = await useCase.execute("coach-joao");

    expect(result.lpLayout).toBe("1");
  });
});
