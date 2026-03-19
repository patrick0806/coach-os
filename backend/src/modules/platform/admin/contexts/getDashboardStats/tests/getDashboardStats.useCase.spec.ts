import { describe, it, expect, beforeEach, vi } from "vitest";

import { GetDashboardStatsUseCase } from "../getDashboardStats.useCase";

const makePersonalsRepository = () => ({
  countAll: vi.fn().mockResolvedValue(10),
  countByAccessStatus: vi.fn().mockResolvedValue(5),
  countCreatedThisMonth: vi.fn().mockResolvedValue(2),
  countWhitelisted: vi.fn().mockResolvedValue(3),
});

const makeStudentsRepository = () => ({
  countAll: vi.fn().mockResolvedValue(42),
});

describe("GetDashboardStatsUseCase", () => {
  let useCase: GetDashboardStatsUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new GetDashboardStatsUseCase(
      personalsRepository as any,
      studentsRepository as any,
    );
  });

  it("should return dashboard stats", async () => {
    const result = await useCase.execute();

    expect(result).toEqual({
      totalCoaches: 10,
      payingCoaches: 5,
      newThisMonth: 2,
      totalStudents: 42,
      whitelistedCoaches: 3,
    });
    expect(personalsRepository.countByAccessStatus).toHaveBeenCalledWith("active");
  });
});
