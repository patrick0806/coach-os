import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateNoteUseCase } from "../updateNote.useCase";

const makeNote = (overrides = {}) => ({
  id: "note-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  note: "Nota original.",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeStudentNotesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeNote()),
  update: vi.fn().mockResolvedValue(makeNote({ note: "Nota atualizada." })),
});

describe("UpdateNoteUseCase", () => {
  let useCase: UpdateNoteUseCase;
  let studentNotesRepository: ReturnType<typeof makeStudentNotesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentNotesRepository = makeStudentNotesRepository();
    useCase = new UpdateNoteUseCase(studentNotesRepository as any);
  });

  it("should update note successfully", async () => {
    const result = await useCase.execute("note-id-1", { note: "Nota atualizada." }, tenantId);

    expect(result.note).toBe("Nota atualizada.");
    expect(studentNotesRepository.update).toHaveBeenCalledWith(
      "note-id-1",
      tenantId,
      "Nota atualizada.",
    );
  });

  it("should throw NotFoundException when note not found", async () => {
    studentNotesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { note: "Nota" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should not update note from different tenant", async () => {
    studentNotesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("note-id-1", { note: "Nota" }, "other-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException on empty note", async () => {
    await expect(useCase.execute("note-id-1", { note: "" }, tenantId)).rejects.toThrow();
  });
});
