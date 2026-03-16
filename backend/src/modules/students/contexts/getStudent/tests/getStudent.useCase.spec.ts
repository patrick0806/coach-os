import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetStudentUseCase } from "../getStudent.useCase";

const makeStudent = (overrides = {}) => ({
  id: "student-id-1",
  userId: "user-id-1",
  tenantId: "tenant-id-1",
  status: "active",
  phoneNumber: "+55 11 99999-9999",
  goal: "Perder peso",
  observations: null,
  physicalRestrictions: null,
  currentStreak: 2,
  lastWorkoutDate: new Date(),
  totalWorkouts: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "Maria Silva",
  email: "maria@email.com",
  ...overrides,
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeStudent()),
});

describe("GetStudentUseCase", () => {
  let useCase: GetStudentUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    useCase = new GetStudentUseCase(studentsRepository as any);
  });

  it("should return student when found", async () => {
    const result = await useCase.execute("student-id-1", tenantId);

    expect(result.id).toBe("student-id-1");
    expect(result.name).toBe("Maria Silva");
    expect(result.email).toBe("maria@email.com");
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should pass tenantId to repository for isolation", async () => {
    await useCase.execute("student-id-1", tenantId);

    expect(studentsRepository.findById).toHaveBeenCalledWith("student-id-1", tenantId);
  });

  it("should not return student from different tenant", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("student-id-1", "other-tenant-id")).rejects.toThrow(
      NotFoundException,
    );
  });
});
