import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateStudentProgramStatusUseCase } from "../updateStudentProgramStatus.useCase";

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

const makeStudentProgramsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeProgram()),
  updateStatus: vi.fn().mockResolvedValue(makeProgram({ status: "finished" })),
});

const makeRecurringSlotsRepository = () => ({
  deactivateByProgramId: vi.fn().mockResolvedValue(0),
});

describe("UpdateStudentProgramStatusUseCase", () => {
  let useCase: UpdateStudentProgramStatusUseCase;
  let studentProgramsRepository: ReturnType<typeof makeStudentProgramsRepository>;
  let recurringSlotsRepository: ReturnType<typeof makeRecurringSlotsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentProgramsRepository = makeStudentProgramsRepository();
    recurringSlotsRepository = makeRecurringSlotsRepository();
    useCase = new UpdateStudentProgramStatusUseCase(
      studentProgramsRepository as any,
      recurringSlotsRepository as any,
    );
  });

  it("should update program status", async () => {
    const result = await useCase.execute("program-id-1", { status: "finished" }, tenantId);

    expect(studentProgramsRepository.updateStatus).toHaveBeenCalledWith(
      "program-id-1",
      tenantId,
      "finished",
    );
    expect(result.status).toBe("finished");
  });

  it("should throw NotFoundException when program not found", async () => {
    studentProgramsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { status: "finished" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when program belongs to different tenant", async () => {
    studentProgramsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("program-id-1", { status: "finished" }, "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should allow setting status to cancelled", async () => {
    studentProgramsRepository.updateStatus.mockResolvedValue(
      makeProgram({ status: "cancelled" }),
    );

    const result = await useCase.execute(
      "program-id-1",
      { status: "cancelled" },
      tenantId,
    );

    expect(result.status).toBe("cancelled");
  });

  it("should throw validation error for invalid status", async () => {
    await expect(
      useCase.execute("program-id-1", { status: "invalid-status" }, tenantId),
    ).rejects.toThrow();
  });
});
