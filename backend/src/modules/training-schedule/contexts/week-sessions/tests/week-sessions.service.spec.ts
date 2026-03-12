import { describe, it, expect, beforeEach, vi } from "vitest";
import { WeekSessionsService } from "../week-sessions.service";

const mockUser = { sub: "user-1", role: "STUDENT", profileId: "student-1", personalId: "personal-1", personalSlug: "coach" };

const makeSession = (date: string, overrides = {}) => ({
  id: `session-${date}`,
  studentId: "student-1",
  personalId: "personal-1",
  scheduleRuleId: "rule-1",
  workoutPlanId: "wp-1",
  workoutSessionId: null,
  scheduledDate: date,
  scheduledTime: null,
  status: "pending",
  sessionType: "online",
  cancelledAt: null,
  cancellationReason: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("WeekSessionsService", () => {
  let service: WeekSessionsService;
  let trainingSessionsRepo: { findWeekByStudent: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    trainingSessionsRepo = { findWeekByStudent: vi.fn() };
    service = new WeekSessionsService(trainingSessionsRepo as any);
  });

  it("should return sessions for the next 7 days", async () => {
    const sessions = [makeSession("2026-03-12"), makeSession("2026-03-14")];
    trainingSessionsRepo.findWeekByStudent.mockResolvedValue(sessions);

    const result = await service.execute(mockUser as any);

    expect(result).toHaveLength(2);
    expect(trainingSessionsRepo.findWeekByStudent).toHaveBeenCalledWith("student-1", "personal-1");
  });

  it("should return empty array when no sessions this week", async () => {
    trainingSessionsRepo.findWeekByStudent.mockResolvedValue([]);

    const result = await service.execute(mockUser as any);

    expect(result).toEqual([]);
  });
});
