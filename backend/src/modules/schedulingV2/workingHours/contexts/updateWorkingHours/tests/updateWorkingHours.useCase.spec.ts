import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateWorkingHoursUseCase } from "../updateWorkingHours.useCase";

const WH_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const NEW_WH_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeWorkingHours = (overrides = {}) => ({
  id: WH_ID,
  tenantId: TENANT_ID,
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "12:00",
  effectiveFrom: "2026-04-01",
  effectiveTo: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeWorkingHours()),
  update: vi.fn().mockResolvedValue(makeWorkingHours({ effectiveTo: "2026-04-10" })),
  create: vi.fn().mockResolvedValue(
    makeWorkingHours({
      id: NEW_WH_ID,
      startTime: "09:00",
      effectiveFrom: "2026-04-10",
    }),
  ),
});

describe("UpdateWorkingHoursUseCase", () => {
  let useCase: UpdateWorkingHoursUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new UpdateWorkingHoursUseCase(repository as any);
  });

  it("should update working hours using versioning pattern", async () => {
    const result = await useCase.execute(
      WH_ID,
      { startTime: "09:00" },
      TENANT_ID,
    );

    expect(result.id).toBe(NEW_WH_ID);
    expect(result.startTime).toBe("09:00");

    // Old record should be closed
    expect(repository.update).toHaveBeenCalledWith(
      WH_ID,
      TENANT_ID,
      expect.objectContaining({ effectiveTo: expect.any(String) }),
    );

    // New record should be created with effectiveFrom = today
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        startTime: "09:00",
        endTime: "12:00",
        dayOfWeek: 1,
        effectiveFrom: expect.any(String),
      }),
    );
  });

  it("should throw NotFoundException when working hours not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(WH_ID, { startTime: "09:00" }, TENANT_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when working hours belong to different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(WH_ID, { startTime: "09:00" }, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should allow partial update and keep existing values", async () => {
    await useCase.execute(WH_ID, { endTime: "14:00" }, TENANT_ID);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "14:00",
      }),
    );
  });

  it("should throw validation error for invalid time format", async () => {
    await expect(
      useCase.execute(WH_ID, { startTime: "invalid" }, TENANT_ID),
    ).rejects.toThrow();
  });

  it("should throw validation error when startTime >= endTime", async () => {
    await expect(
      useCase.execute(WH_ID, { startTime: "14:00", endTime: "12:00" }, TENANT_ID),
    ).rejects.toThrow();
  });
});
