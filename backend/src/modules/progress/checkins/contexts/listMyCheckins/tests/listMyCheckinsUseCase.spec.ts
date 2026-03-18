import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListMyCheckinsUseCase } from "../listMyCheckinsUseCase";

const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeCheckin = (overrides = {}) => ({
  id: "checkin-1",
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

const makeRepository = () => ({
  findAllByStudentId: vi.fn().mockResolvedValue({
    rows: [makeCheckin()],
    total: 1,
  }),
});

describe("ListMyCheckinsUseCase", () => {
  let useCase: ListMyCheckinsUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListMyCheckinsUseCase(repository as any);
  });

  it("should return paginated checkins for the student", async () => {
    const result = await useCase.execute(STUDENT_ID, TENANT_ID, {
      page: 0,
      size: 10,
    });

    expect(result.content).toHaveLength(1);
    expect(result.totalElements).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("should return empty list when no checkins exist", async () => {
    repository.findAllByStudentId.mockResolvedValue({ rows: [], total: 0 });

    const result = await useCase.execute(STUDENT_ID, TENANT_ID, {
      page: 0,
      size: 10,
    });

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("should pass studentId and tenantId to the repository", async () => {
    await useCase.execute(STUDENT_ID, TENANT_ID, { page: 0, size: 10 });

    expect(repository.findAllByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      { page: 0, size: 10 },
    );
  });

  it("should calculate totalPages correctly", async () => {
    repository.findAllByStudentId.mockResolvedValue({ rows: [], total: 25 });

    const result = await useCase.execute(STUDENT_ID, TENANT_ID, {
      page: 0,
      size: 10,
    });

    expect(result.totalPages).toBe(3);
  });

  it("should respect custom pagination params", async () => {
    await useCase.execute(STUDENT_ID, TENANT_ID, { page: 2, size: 5 });

    expect(repository.findAllByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      { page: 2, size: 5 },
    );
  });
});
