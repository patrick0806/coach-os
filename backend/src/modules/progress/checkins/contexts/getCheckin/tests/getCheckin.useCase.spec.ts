import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetCheckinUseCase } from "../getCheckin.useCase";

const CHECKIN_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";
const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";

const makeCheckin = (overrides = {}) => ({
  id: CHECKIN_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  checkinDate: "2026-01-15",
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  records: [{ id: "r1", metricType: "weight", value: "80.00", unit: "kg", notes: null }],
  photos: [],
  ...overrides,
});

const makeCheckinsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeCheckin()),
});

describe("GetCheckinUseCase", () => {
  let useCase: GetCheckinUseCase;
  let checkinsRepository: ReturnType<typeof makeCheckinsRepository>;

  beforeEach(() => {
    checkinsRepository = makeCheckinsRepository();
    useCase = new GetCheckinUseCase(checkinsRepository as any);
  });

  it("should return checkin with data", async () => {
    const result = await useCase.execute(CHECKIN_ID, TENANT_ID);

    expect(result.id).toBe(CHECKIN_ID);
    expect(result.records).toHaveLength(1);
  });

  it("should throw NotFoundException when checkin not found", async () => {
    checkinsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", TENANT_ID)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when tenant does not match", async () => {
    checkinsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(CHECKIN_ID, "wrong-tenant")).rejects.toThrow(NotFoundException);
  });

  it("should return checkin without records or photos", async () => {
    checkinsRepository.findById.mockResolvedValue(makeCheckin({ records: [], photos: [] }));

    const result = await useCase.execute(CHECKIN_ID, TENANT_ID);

    expect(result.records).toHaveLength(0);
    expect(result.photos).toHaveLength(0);
  });
});
