import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateStudentUseCase } from "../updateStudent.useCase";

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
  findById: vi.fn().mockResolvedValue(makeStudent()),
  update: vi.fn().mockResolvedValue(makeStudent()),
});

describe("UpdateStudentUseCase", () => {
  let useCase: UpdateStudentUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    useCase = new UpdateStudentUseCase(studentsRepository as any);
  });

  it("should update student successfully", async () => {
    studentsRepository.findById
      .mockResolvedValueOnce(makeStudent())
      .mockResolvedValueOnce(makeStudent({ goal: "Perder peso", phoneNumber: "5511999999999" }));

    const result = await useCase.execute(
      "student-id-1",
      { goal: "Perder peso", phoneNumber: "+55 11 99999-9999" },
      tenantId,
    );

    expect(studentsRepository.update).toHaveBeenCalledWith(
      "student-id-1",
      tenantId,
      expect.objectContaining({ goal: "Perder peso" }),
    );
    expect(result).toBeDefined();
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { goal: "Perder peso" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should not update student from different tenant", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("student-id-1", { goal: "Perder peso" }, "other-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should allow partial updates", async () => {
    await useCase.execute("student-id-1", { phoneNumber: "11900000000" }, tenantId);

    expect(studentsRepository.update).toHaveBeenCalledWith(
      "student-id-1",
      tenantId,
      expect.objectContaining({ phoneNumber: "11900000000" }),
    );
  });

  it("should normalize phone number by stripping non-digit characters", async () => {
    await useCase.execute("student-id-1", { phoneNumber: "(11) 99999-9999" }, tenantId);

    expect(studentsRepository.update).toHaveBeenCalledWith(
      "student-id-1",
      tenantId,
      expect.objectContaining({ phoneNumber: "11999999999" }),
    );
  });

  it("should throw ValidationException on invalid input", async () => {
    await expect(
      useCase.execute("student-id-1", { goal: "A".repeat(301) }, tenantId),
    ).rejects.toThrow();
  });

  it("should update student name", async () => {
    studentsRepository.findById
      .mockResolvedValueOnce(makeStudent())
      .mockResolvedValueOnce(makeStudent({ name: "Maria Souza" }));

    const result = await useCase.execute(
      "student-id-1",
      { name: "Maria Souza" },
      tenantId,
    );

    expect(studentsRepository.update).toHaveBeenCalledWith(
      "student-id-1",
      tenantId,
      expect.objectContaining({ name: "Maria Souza" }),
    );
    expect(result).toBeDefined();
  });
});
