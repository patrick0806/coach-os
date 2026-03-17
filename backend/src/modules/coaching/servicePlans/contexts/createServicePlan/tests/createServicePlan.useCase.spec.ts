import { describe, it, expect, beforeEach, vi } from "vitest";

import { CreateServicePlanUseCase } from "../createServicePlan.useCase";

const makePlan = (overrides = {}) => ({
  id: "plan-id-1",
  tenantId: "tenant-id-1",
  name: "Consultoria Online",
  description: null,
  price: "49.90",
  sessionsPerWeek: null,
  durationMinutes: null,
  attendanceType: "online" as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  create: vi.fn().mockResolvedValue(makePlan()),
});

describe("CreateServicePlanUseCase", () => {
  let useCase: CreateServicePlanUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new CreateServicePlanUseCase(repository as any);
  });

  it("should create a service plan successfully", async () => {
    const result = await useCase.execute(
      { name: "Consultoria Online", price: 49.9, attendanceType: "online" },
      tenantId,
    );

    expect(result.id).toBe("plan-id-1");
    expect(repository.create).toHaveBeenCalledWith({
      tenantId,
      name: "Consultoria Online",
      description: null,
      price: "49.9",
      sessionsPerWeek: null,
      durationMinutes: null,
      attendanceType: "online",
    });
  });

  it("should create a plan with all optional fields", async () => {
    repository.create.mockResolvedValue(
      makePlan({ sessionsPerWeek: 3, durationMinutes: 60, description: "Desc" }),
    );

    const result = await useCase.execute(
      {
        name: "Treino Presencial",
        price: 99.9,
        attendanceType: "presential",
        sessionsPerWeek: 3,
        durationMinutes: 60,
        description: "Desc",
      },
      tenantId,
    );

    expect(result.sessionsPerWeek).toBe(3);
    expect(result.durationMinutes).toBe(60);
  });

  it("should throw ValidationException when name is empty", async () => {
    await expect(
      useCase.execute({ name: "", price: 49.9, attendanceType: "online" }, tenantId),
    ).rejects.toThrow();
  });

  it("should throw ValidationException when price is negative", async () => {
    await expect(
      useCase.execute({ name: "Plan", price: -10, attendanceType: "online" }, tenantId),
    ).rejects.toThrow();
  });

  it("should throw ValidationException when attendanceType is invalid", async () => {
    await expect(
      useCase.execute({ name: "Plan", price: 49.9, attendanceType: "invalid" }, tenantId),
    ).rejects.toThrow();
  });
});
