import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CreateStudentNoteService } from "../create-student-note.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("CreateStudentNoteService", () => {
  let service: CreateStudentNoteService;
  let studentsRepository: { findById: ReturnType<typeof vi.fn> };
  let studentNotesRepository: { create: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepository = { findById: vi.fn() };
    studentNotesRepository = { create: vi.fn() };

    service = new CreateStudentNoteService(
      studentsRepository as never,
      studentNotesRepository as never,
    );
  });

  it("should create a note for a student", async () => {
    const createdNote = {
      id: "note-id",
      studentId: "student-id",
      personalId: "personal-id",
      note: "Aluno relatou dor no ombro.",
      createdAt: new Date("2026-03-11T10:00:00Z"),
      updatedAt: new Date("2026-03-11T10:00:00Z"),
    };

    studentsRepository.findById.mockResolvedValue({ id: "student-id" });
    studentNotesRepository.create.mockResolvedValue(createdNote);

    const result = await service.execute(
      "student-id",
      { note: "Aluno relatou dor no ombro." },
      mockCurrentUser,
    );

    expect(studentsRepository.findById).toHaveBeenCalledWith("student-id", "personal-id");
    expect(studentNotesRepository.create).toHaveBeenCalledWith({
      studentId: "student-id",
      personalId: "personal-id",
      note: "Aluno relatou dor no ombro.",
    });
    expect(result).toEqual(createdNote);
  });

  it("should throw NotFoundException when student does not exist", async () => {
    studentsRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute("student-id", { note: "Teste" }, mockCurrentUser),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when note is invalid", async () => {
    await expect(
      service.execute("student-id", { note: "" }, mockCurrentUser),
    ).rejects.toThrow(BadRequestException);
  });
});
