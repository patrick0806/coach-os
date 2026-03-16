import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateStudentStatusUseCase } from "../updateStudentStatus.useCase";

const makeStudent = (overrides = {}) => ({
  id: "student-id-1",
  userId: "user-id-1",
  tenantId: "tenant-id-1",
  status: "active",
  name: "Maria Silva",
  email: "maria@email.com",
  ...overrides,
});

const makeRelation = (overrides = {}) => ({
  id: "relation-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  status: "active",
  startDate: new Date(),
  endDate: null,
  ...overrides,
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeStudent()),
  updateStatus: vi.fn().mockResolvedValue(makeStudent()),
});

const makeCoachStudentRelationsRepository = () => ({
  findByStudentIdAndTenantId: vi.fn().mockResolvedValue(makeRelation()),
  updateStatus: vi.fn().mockResolvedValue(makeRelation()),
});

describe("UpdateStudentStatusUseCase", () => {
  let useCase: UpdateStudentStatusUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let coachStudentRelationsRepository: ReturnType<typeof makeCoachStudentRelationsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    coachStudentRelationsRepository = makeCoachStudentRelationsRepository();
    useCase = new UpdateStudentStatusUseCase(
      studentsRepository as any,
      coachStudentRelationsRepository as any,
    );
  });

  it("should update student status to active", async () => {
    await useCase.execute("student-id-1", { status: "active" }, tenantId);

    expect(studentsRepository.updateStatus).toHaveBeenCalledWith(
      "student-id-1",
      tenantId,
      "active",
    );
  });

  it("should update student status to paused", async () => {
    await useCase.execute("student-id-1", { status: "paused" }, tenantId);

    expect(studentsRepository.updateStatus).toHaveBeenCalledWith(
      "student-id-1",
      tenantId,
      "paused",
    );
  });

  it("should archive relation with endDate when status is archived", async () => {
    await useCase.execute("student-id-1", { status: "archived" }, tenantId);

    expect(coachStudentRelationsRepository.updateStatus).toHaveBeenCalledWith(
      "relation-id-1",
      tenantId,
      "archived",
      expect.any(Date),
    );
  });

  it("should not update relation when status is not archived", async () => {
    await useCase.execute("student-id-1", { status: "paused" }, tenantId);

    expect(coachStudentRelationsRepository.updateStatus).not.toHaveBeenCalled();
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { status: "active" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException on invalid status", async () => {
    await expect(
      useCase.execute("student-id-1", { status: "invalid" }, tenantId),
    ).rejects.toThrow();
  });
});
