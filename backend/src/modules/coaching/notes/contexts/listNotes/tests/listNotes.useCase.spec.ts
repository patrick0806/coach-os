import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ListNotesUseCase } from "../listNotes.useCase";

const makeNote = (overrides = {}) => ({
  id: "note-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  note: "Aluna com boa evolução.",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeStudentNotesRepository = () => ({
  findByStudentId: vi.fn().mockResolvedValue([makeNote()]),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: "student-id-1", tenantId: "tenant-id-1" }),
});

describe("ListNotesUseCase", () => {
  let useCase: ListNotesUseCase;
  let studentNotesRepository: ReturnType<typeof makeStudentNotesRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentNotesRepository = makeStudentNotesRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new ListNotesUseCase(studentNotesRepository as any, studentsRepository as any);
  });

  it("should return notes ordered by createdAt", async () => {
    const result = await useCase.execute("student-id-1", tenantId);

    expect(result).toHaveLength(1);
    expect(result[0].note).toBe("Aluna com boa evolução.");
  });

  it("should return empty array when student has no notes", async () => {
    studentNotesRepository.findByStudentId.mockResolvedValue([]);

    const result = await useCase.execute("student-id-1", tenantId);

    expect(result).toHaveLength(0);
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow(NotFoundException);
  });
});
