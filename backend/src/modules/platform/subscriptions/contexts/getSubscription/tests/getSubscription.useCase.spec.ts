import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetSubscriptionUseCase } from "../getSubscription.useCase";

const makePersonal = (overrides = {}) => ({
  id: "personal-id-1",
  accessStatus: "active",
  subscriptionStatus: "active",
  subscriptionPlanId: "plan-id-1",
  trialEndsAt: null,
  subscriptionExpiresAt: null,
  ...overrides,
});

const makePlan = (overrides = {}) => ({
  id: "plan-id-1",
  name: "Básico",
  price: "29.90",
  maxStudents: 10,
  highlighted: false,
  ...overrides,
});

const makePersonalsRepository = (personal = makePersonal()) => ({
  findById: vi.fn().mockResolvedValue(personal),
});

const makePlansRepository = (plan = makePlan()) => ({
  findById: vi.fn().mockResolvedValue(plan),
});

const makeStudentsRepository = (count = 3) => ({
  countByTenantId: vi.fn().mockResolvedValue(count),
});

describe("GetSubscriptionUseCase", () => {
  let useCase: GetSubscriptionUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    plansRepository = makePlansRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new GetSubscriptionUseCase(
      personalsRepository as any,
      plansRepository as any,
      studentsRepository as any,
    );
  });

  it("should return subscription details for an active personal", async () => {
    const result = await useCase.execute("personal-id-1");

    expect(result).toEqual({
      plan: {
        id: "plan-id-1",
        name: "Básico",
        price: "29.90",
        maxStudents: 10,
        highlighted: false,
      },
      accessStatus: "active",
      subscriptionStatus: "active",
      trialEndsAt: null,
      subscriptionExpiresAt: null,
      studentsCount: 3,
      studentsLimit: 10,
    });
  });

  it("should throw NotFoundException when personal is not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id")).rejects.toThrow(NotFoundException);
  });

  it("should return null plan when subscriptionPlanId is absent", async () => {
    personalsRepository = makePersonalsRepository(makePersonal({ subscriptionPlanId: null }));
    useCase = new GetSubscriptionUseCase(
      personalsRepository as any,
      plansRepository as any,
      studentsRepository as any,
    );

    const result = await useCase.execute("personal-id-1");

    expect(result.plan).toBeNull();
    expect(result.studentsLimit).toBe(0);
    expect(plansRepository.findById).not.toHaveBeenCalled();
  });

  it("should include trialEndsAt as ISO string when present", async () => {
    const trialDate = new Date("2025-01-15T00:00:00Z");
    personalsRepository = makePersonalsRepository(makePersonal({ trialEndsAt: trialDate, accessStatus: "trialing", subscriptionStatus: "trialing" }));
    useCase = new GetSubscriptionUseCase(
      personalsRepository as any,
      plansRepository as any,
      studentsRepository as any,
    );

    const result = await useCase.execute("personal-id-1");

    expect(result.trialEndsAt).toBe(trialDate.toISOString());
  });

  it("should correctly report studentsCount", async () => {
    studentsRepository = makeStudentsRepository(7);
    useCase = new GetSubscriptionUseCase(
      personalsRepository as any,
      plansRepository as any,
      studentsRepository as any,
    );

    const result = await useCase.execute("personal-id-1");

    expect(result.studentsCount).toBe(7);
    expect(studentsRepository.countByTenantId).toHaveBeenCalledWith("personal-id-1");
  });

  it("should handle expired access status", async () => {
    personalsRepository = makePersonalsRepository(makePersonal({ accessStatus: "expired", subscriptionStatus: "canceled" }));
    useCase = new GetSubscriptionUseCase(
      personalsRepository as any,
      plansRepository as any,
      studentsRepository as any,
    );

    const result = await useCase.execute("personal-id-1");

    expect(result.accessStatus).toBe("expired");
    expect(result.subscriptionStatus).toBe("canceled");
  });
});
