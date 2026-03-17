import { describe, it, expect, beforeEach, vi } from "vitest";

import { GetStatsUseCase } from "../getStats.useCase";

const makeCounts = (overrides = {}) => ({
  activeStudents: 3,
  totalStudents: 5,
  programTemplates: 3,
  activeStudentPrograms: 3,
  ...overrides,
});

const makeRepository = () => ({
  getCounts: vi.fn().mockResolvedValue(makeCounts()),
});

describe("GetStatsUseCase", () => {
  let useCase: GetStatsUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new GetStatsUseCase(repository as any);
  });

  it("should return dashboard stats for the tenant", async () => {
    const result = await useCase.execute(tenantId);

    expect(result.activeStudents).toBe(3);
    expect(result.totalStudents).toBe(5);
    expect(result.programTemplates).toBe(3);
    expect(result.activeStudentPrograms).toBe(3);
    expect(repository.getCounts).toHaveBeenCalledWith(tenantId);
  });

  it("should return zeroes when tenant has no data", async () => {
    repository.getCounts.mockResolvedValue(
      makeCounts({
        activeStudents: 0,
        totalStudents: 0,
        programTemplates: 0,
        activeStudentPrograms: 0,
      }),
    );

    const result = await useCase.execute(tenantId);

    expect(result.activeStudents).toBe(0);
    expect(result.totalStudents).toBe(0);
    expect(result.programTemplates).toBe(0);
    expect(result.activeStudentPrograms).toBe(0);
  });

  it("should pass the correct tenantId to the repository", async () => {
    const differentTenantId = "tenant-id-2";

    await useCase.execute(differentTenantId);

    expect(repository.getCounts).toHaveBeenCalledWith(differentTenantId);
    expect(repository.getCounts).not.toHaveBeenCalledWith(tenantId);
  });

  it("should reflect partial active student count correctly", async () => {
    repository.getCounts.mockResolvedValue(
      makeCounts({
        activeStudents: 2,
        totalStudents: 5,
        programTemplates: 3,
        activeStudentPrograms: 2,
      }),
    );

    const result = await useCase.execute(tenantId);

    expect(result.activeStudents).toBe(2);
    expect(result.totalStudents).toBe(5);
    expect(result.activeStudentPrograms).toBe(2);
  });
});
