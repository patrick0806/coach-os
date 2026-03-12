import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ListTrainingSessionsService } from "../list-training-sessions.service";

const mockUser = { sub: "user-1", role: "PERSONAL", profileId: "personal-1", personalId: "personal-1", personalSlug: "coach" };
const studentId = "student-1";

describe("ListTrainingSessionsService", () => {
  let service: ListTrainingSessionsService;
  let studentsRepo: { findById: ReturnType<typeof vi.fn> };
  let trainingSessionsRepo: { findByStudentAndDateRange: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepo = { findById: vi.fn() };
    trainingSessionsRepo = { findByStudentAndDateRange: vi.fn() };
    service = new ListTrainingSessionsService(studentsRepo as any, trainingSessionsRepo as any);
  });

  it("should throw NotFoundException when student does not belong to personal", async () => {
    studentsRepo.findById.mockResolvedValue(null);
    await expect(service.execute(studentId, { from: "2026-03-12", to: "2026-04-12" }, mockUser as any))
      .rejects.toThrow(NotFoundException);
  });

  it("should return sessions for the date range", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const sessions = [{ id: "s1", scheduledDate: "2026-03-15" }];
    trainingSessionsRepo.findByStudentAndDateRange.mockResolvedValue(sessions);

    const result = await service.execute(studentId, { from: "2026-03-12", to: "2026-04-12" }, mockUser as any);

    expect(result).toEqual(sessions);
    expect(trainingSessionsRepo.findByStudentAndDateRange).toHaveBeenCalledWith(
      studentId,
      "personal-1",
      "2026-03-12",
      "2026-04-12",
    );
  });
});
