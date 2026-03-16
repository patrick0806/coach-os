import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListRelationsUseCase } from "../listRelations.useCase";

const makeRelation = (overrides = {}) => ({
  id: "relation-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  status: "active",
  startDate: new Date(),
  endDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  studentName: "Maria Silva",
  studentEmail: "maria@email.com",
  ...overrides,
});

const makeCoachStudentRelationsRepository = () => ({
  findByTenantId: vi.fn().mockResolvedValue([makeRelation()]),
});

describe("ListRelationsUseCase", () => {
  let useCase: ListRelationsUseCase;
  let coachStudentRelationsRepository: ReturnType<typeof makeCoachStudentRelationsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    coachStudentRelationsRepository = makeCoachStudentRelationsRepository();
    useCase = new ListRelationsUseCase(coachStudentRelationsRepository as any);
  });

  it("should return all relations for tenant", async () => {
    const result = await useCase.execute(tenantId);

    expect(result).toHaveLength(1);
    expect(result[0].studentName).toBe("Maria Silva");
    expect(result[0].studentEmail).toBe("maria@email.com");
  });

  it("should return empty array when no relations", async () => {
    coachStudentRelationsRepository.findByTenantId.mockResolvedValue([]);

    const result = await useCase.execute(tenantId);

    expect(result).toHaveLength(0);
  });

  it("should use tenantId for isolation", async () => {
    await useCase.execute(tenantId);

    expect(coachStudentRelationsRepository.findByTenantId).toHaveBeenCalledWith(tenantId);
  });
});
