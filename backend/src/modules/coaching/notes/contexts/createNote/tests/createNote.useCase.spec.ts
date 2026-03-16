import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { CreateNoteUseCase } from "../createNote.useCase";

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
  create: vi.fn().mockResolvedValue(makeNote()),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: "student-id-1", tenantId: "tenant-id-1" }),
});

describe("CreateNoteUseCase", () => {
  let useCase: CreateNoteUseCase;
  let studentNotesRepository: ReturnType<typeof makeStudentNotesRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentNotesRepository = makeStudentNotesRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new CreateNoteUseCase(studentNotesRepository as any, studentsRepository as any);
  });

  it("should create note successfully", async () => {
    const result = await useCase.execute("student-id-1", { note: "Aluna com boa evolução." }, tenantId);

    expect(result.id).toBe("note-id-1");
    expect(result.note).toBe("Aluna com boa evolução.");
    expect(studentNotesRepository.create).toHaveBeenCalledWith({
      tenantId,
      studentId: "student-id-1",
      note: "Aluna com boa evolução.",
    });
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { note: "Nota" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException on empty note", async () => {
    await expect(useCase.execute("student-id-1", { note: "" }, tenantId)).rejects.toThrow();
  });

  it("should enforce tenant isolation via student lookup", async () => {
    await useCase.execute("student-id-1", { note: "Nota" }, tenantId);

    expect(studentsRepository.findById).toHaveBeenCalledWith("student-id-1", tenantId);
  });
});
