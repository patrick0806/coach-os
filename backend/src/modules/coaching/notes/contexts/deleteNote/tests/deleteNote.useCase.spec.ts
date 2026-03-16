import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteNoteUseCase } from "../deleteNote.useCase";

const makeNote = (overrides = {}) => ({
  id: "note-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  note: "Nota a ser deletada.",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeStudentNotesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeNote()),
  delete: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteNoteUseCase", () => {
  let useCase: DeleteNoteUseCase;
  let studentNotesRepository: ReturnType<typeof makeStudentNotesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentNotesRepository = makeStudentNotesRepository();
    useCase = new DeleteNoteUseCase(studentNotesRepository as any);
  });

  it("should delete note successfully", async () => {
    await useCase.execute("note-id-1", tenantId);

    expect(studentNotesRepository.delete).toHaveBeenCalledWith("note-id-1", tenantId);
  });

  it("should throw NotFoundException when note not found", async () => {
    studentNotesRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should not delete note from different tenant", async () => {
    studentNotesRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("note-id-1", "other-tenant")).rejects.toThrow(NotFoundException);
  });
});
