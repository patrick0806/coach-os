import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListStudentProgramsUseCase } from "../listStudentPrograms.useCase";

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

describe("ListStudentProgramsUseCase", () => {
  let useCase: ListStudentProgramsUseCase;
  let studentProgramsRepository: ReturnType<typeof makeStudentProgramsRepository>;

  const tenantId = "tenant-id-1";
  const studentId = "student-id-1";

  beforeEach(() => {
    studentProgramsRepository = makeStudentProgramsRepository();
    useCase = new ListStudentProgramsUseCase(studentProgramsRepository as any);
  });

  it("should return paginated list of student programs", async () => {
    const result = await useCase.execute(studentId, {}, tenantId);

    expect(result.content).toHaveLength(1);
    expect(result.totalElements).toBe(1);
    expect(result.page).toBe(0);
    expect(result.size).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it("should apply status filter", async () => {
    await useCase.execute(studentId, { status: "finished" }, tenantId);

    expect(studentProgramsRepository.findAllByStudentAndTenant).toHaveBeenCalledWith(
      studentId,
      tenantId,
      expect.objectContaining({ status: "finished" }),
    );
  });

  it("should return empty list when student has no programs", async () => {
    studentProgramsRepository.findAllByStudentAndTenant.mockResolvedValue({
      rows: [],
      total: 0,
    });

    const result = await useCase.execute(studentId, {}, tenantId);

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("should apply custom pagination", async () => {
    const programs = Array.from({ length: 5 }, (_, i) =>
      makeProgram({ id: `program-id-${i}` }),
    );
    studentProgramsRepository.findAllByStudentAndTenant.mockResolvedValue({
      rows: programs,
      total: 15,
    });

    const result = await useCase.execute(studentId, { page: "1", size: "5" }, tenantId);

    expect(result.page).toBe(1);
    expect(result.size).toBe(5);
    expect(result.totalElements).toBe(15);
    expect(result.totalPages).toBe(3);
  });

  it("should filter by tenantId", async () => {
    await useCase.execute(studentId, {}, tenantId);

    expect(studentProgramsRepository.findAllByStudentAndTenant).toHaveBeenCalledWith(
      studentId,
      tenantId,
      expect.any(Object),
    );
  });
});
