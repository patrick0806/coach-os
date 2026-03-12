import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { GetScheduleRulesService } from "../get-schedule-rules.service";

const mockUser = { sub: "user-1", role: "PERSONAL", profileId: "personal-1", personalId: "personal-1", personalSlug: "coach" };
const studentId = "student-1";

describe("GetScheduleRulesService", () => {
  let service: GetScheduleRulesService;
  let studentsRepo: { findById: ReturnType<typeof vi.fn> };
  let scheduleRulesRepo: { findByStudent: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepo = { findById: vi.fn() };
    scheduleRulesRepo = { findByStudent: vi.fn() };
    service = new GetScheduleRulesService(studentsRepo as any, scheduleRulesRepo as any);
  });

  it("should throw NotFoundException when student does not belong to personal", async () => {
    studentsRepo.findById.mockResolvedValue(null);
    await expect(service.execute(studentId, mockUser as any)).rejects.toThrow(NotFoundException);
  });

  it("should return schedule rules for the student", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const rules = [{ id: "rule-1", dayOfWeek: 1 }, { id: "rule-2", dayOfWeek: 3 }];
    scheduleRulesRepo.findByStudent.mockResolvedValue(rules);

    const result = await service.execute(studentId, mockUser as any);

    expect(result).toEqual(rules);
    expect(scheduleRulesRepo.findByStudent).toHaveBeenCalledWith(studentId, "personal-1");
  });

  it("should return empty array when no rules configured", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    scheduleRulesRepo.findByStudent.mockResolvedValue([]);

    const result = await service.execute(studentId, mockUser as any);

    expect(result).toEqual([]);
  });
});
