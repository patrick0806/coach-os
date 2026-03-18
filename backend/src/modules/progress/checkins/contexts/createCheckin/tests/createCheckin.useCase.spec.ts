import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { CreateCheckinUseCase } from "../createCheckin.useCase";

const CHECKIN_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeCheckin = (overrides = {}) => ({
  id: CHECKIN_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  checkinDate: "2026-01-15",
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  records: [],
  photos: [],
  ...overrides,
});

const makeCheckinsRepository = () => ({
  createWithData: vi.fn().mockResolvedValue(makeCheckin()),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

describe("CreateCheckinUseCase", () => {
  let useCase: CreateCheckinUseCase;
  let checkinsRepository: ReturnType<typeof makeCheckinsRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  beforeEach(() => {
    checkinsRepository = makeCheckinsRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new CreateCheckinUseCase(
      checkinsRepository as any,
      studentsRepository as any,
    );
  });

  it("should create a checkin with records and photos", async () => {
    const records = [{ metricType: "weight", value: 80, unit: "kg" }];
    const photos = [{ mediaUrl: "https://example.com/photo.jpg" }];

    checkinsRepository.createWithData.mockResolvedValue(
      makeCheckin({
        records: [{ id: "r1", metricType: "weight", value: "80.00", unit: "kg", notes: null }],
        photos: [{ id: "p1", mediaUrl: "https://example.com/photo.jpg", notes: null }],
      }),
    );

    const result = await useCase.execute(
      STUDENT_ID,
      { checkinDate: "2026-01-15", records, photos },
      TENANT_ID,
    );

    expect(result.id).toBe(CHECKIN_ID);
    expect(result.records).toHaveLength(1);
    expect(result.photos).toHaveLength(1);
  });

  it("should create a checkin with only records", async () => {
    const result = await useCase.execute(
      STUDENT_ID,
      { checkinDate: "2026-01-15", records: [{ metricType: "weight", value: 80, unit: "kg" }], photos: [] },
      TENANT_ID,
    );

    expect(checkinsRepository.createWithData).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("should create a checkin with only photos", async () => {
    const result = await useCase.execute(
      STUDENT_ID,
      { checkinDate: "2026-01-15", records: [], photos: [{ mediaUrl: "https://example.com/photo.jpg" }] },
      TENANT_ID,
    );

    expect(checkinsRepository.createWithData).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        "nonexistent-id",
        { checkinDate: "2026-01-15", records: [{ metricType: "weight", value: 80, unit: "kg" }], photos: [] },
        TENANT_ID,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw when checkinDate is invalid", async () => {
    await expect(
      useCase.execute(
        STUDENT_ID,
        { checkinDate: "not-a-date", records: [{ metricType: "weight", value: 80, unit: "kg" }], photos: [] },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw when no records and no photos", async () => {
    await expect(
      useCase.execute(
        STUDENT_ID,
        { checkinDate: "2026-01-15", records: [], photos: [] },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should pass tenantId to studentsRepository", async () => {
    await useCase.execute(
      STUDENT_ID,
      { checkinDate: "2026-01-15", records: [{ metricType: "weight", value: 80, unit: "kg" }], photos: [] },
      TENANT_ID,
    );

    expect(studentsRepository.findById).toHaveBeenCalledWith(STUDENT_ID, TENANT_ID);
  });
});
