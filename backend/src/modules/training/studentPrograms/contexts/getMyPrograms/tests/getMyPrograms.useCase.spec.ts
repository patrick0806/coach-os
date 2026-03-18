import { describe, it, expect, beforeEach, vi } from "vitest";

import { GetMyProgramsUseCase } from "../getMyPrograms.useCase";

const makeProgram = (overrides = {}) => ({
  id: "program-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  programTemplateId: null,
  name: "Programa de Força",
  status: "active",
  startedAt: null,
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeStudentProgramsRepository = (rows = [makeProgram()], total = 1) => ({
  findAllByStudentAndTenant: vi.fn().mockResolvedValue({ rows, total }),
});

describe("GetMyProgramsUseCase", () => {
  let useCase: GetMyProgramsUseCase;
  let studentProgramsRepository: ReturnType<typeof makeStudentProgramsRepository>;

  const tenantId = "tenant-id-1";
  const studentId = "student-id-1";

  beforeEach(() => {
    studentProgramsRepository = makeStudentProgramsRepository();
    useCase = new GetMyProgramsUseCase(studentProgramsRepository as any);
  });

  it("should return active programs for the authenticated student", async () => {
    const result = await useCase.execute(studentId, tenantId);

    expect(result.content).toHaveLength(1);
    expect(result.totalElements).toBe(1);
    expect(result.page).toBe(0);
    expect(result.size).toBe(50);
    expect(result.totalPages).toBe(1);
  });

  it("should return empty list when student has no programs", async () => {
    studentProgramsRepository.findAllByStudentAndTenant.mockResolvedValue({
      rows: [],
      total: 0,
    });

    const result = await useCase.execute(studentId, tenantId);

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("should pass correct studentId and tenantId to repository", async () => {
    await useCase.execute(studentId, tenantId);

    expect(studentProgramsRepository.findAllByStudentAndTenant).toHaveBeenCalledWith(
      studentId,
      tenantId,
      expect.objectContaining({ status: "active", page: 0, size: 50 }),
    );
  });
});
