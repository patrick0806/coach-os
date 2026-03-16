import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListStudentsUseCase } from "../listStudents.useCase";

const makeStudent = (overrides = {}) => ({
  id: "student-id-1",
  userId: "user-id-1",
  tenantId: "tenant-id-1",
  status: "active",
  phoneNumber: null,
  goal: null,
  observations: null,
  physicalRestrictions: null,
  currentStreak: 0,
  lastWorkoutDate: null,
  totalWorkouts: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "Maria Silva",
  email: "maria@email.com",
  ...overrides,
});

const makeStudentsRepository = () => ({
  findAllByTenantId: vi.fn().mockResolvedValue({
    rows: [makeStudent()],
    total: 1,
  }),
});

describe("ListStudentsUseCase", () => {
  let useCase: ListStudentsUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    useCase = new ListStudentsUseCase(studentsRepository as any);
  });

  it("should return paginated students", async () => {
    const result = await useCase.execute({}, tenantId);

    expect(result.content).toHaveLength(1);
    expect(result.page).toBe(0);
    expect(result.size).toBe(10);
    expect(result.totalElements).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("should use default page and size when not provided", async () => {
    await useCase.execute({}, tenantId);

    expect(studentsRepository.findAllByTenantId).toHaveBeenCalledWith(tenantId, {
      page: 0,
      size: 10,
      search: undefined,
      status: undefined,
    });
  });

  it("should pass search filter to repository", async () => {
    await useCase.execute({ search: "maria" }, tenantId);

    expect(studentsRepository.findAllByTenantId).toHaveBeenCalledWith(tenantId, {
      page: 0,
      size: 10,
      search: "maria",
      status: undefined,
    });
  });

  it("should pass status filter to repository", async () => {
    await useCase.execute({ status: "active" }, tenantId);

    expect(studentsRepository.findAllByTenantId).toHaveBeenCalledWith(tenantId, {
      page: 0,
      size: 10,
      search: undefined,
      status: "active",
    });
  });

  it("should calculate totalPages correctly", async () => {
    studentsRepository.findAllByTenantId.mockResolvedValue({ rows: [], total: 25 });

    const result = await useCase.execute({ size: "10" }, tenantId);

    expect(result.totalPages).toBe(3);
  });

  it("should return empty content when no students found", async () => {
    studentsRepository.findAllByTenantId.mockResolvedValue({ rows: [], total: 0 });

    const result = await useCase.execute({}, tenantId);

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
