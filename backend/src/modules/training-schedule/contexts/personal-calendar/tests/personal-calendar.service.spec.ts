import { describe, it, expect, beforeEach, vi } from "vitest";
import { PersonalCalendarService } from "../personal-calendar.service";

const mockUser = {
  sub: "user-1",
  role: "PERSONAL",
  profileId: "personal-1",
  personalId: "personal-1",
  personalSlug: "coach",
};

const makeSession = (overrides = {}) => ({
  id: "session-1",
  personalId: "personal-1",
  studentId: "student-1",
  scheduleRuleId: "rule-1",
  workoutPlanId: "wp-1",
  workoutSessionId: null,
  scheduledDate: "2026-03-16",
  startTime: "07:00",
  endTime: "08:00",
  status: "pending" as const,
  sessionType: "presential" as const,
  cancelledAt: null,
  cancellationReason: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  studentName: "João Silva",
  ...overrides,
});

describe("PersonalCalendarService", () => {
  let service: PersonalCalendarService;
  let trainingSessionsRepo: { findByPersonalAndDateRange: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    trainingSessionsRepo = {
      findByPersonalAndDateRange: vi.fn().mockResolvedValue([]),
    };
    service = new PersonalCalendarService(trainingSessionsRepo as any);
  });

  it("should return sessions for the personal in the given date range", async () => {
    const sessions = [makeSession(), makeSession({ id: "session-2", scheduledDate: "2026-03-17" })];
    trainingSessionsRepo.findByPersonalAndDateRange.mockResolvedValue(sessions);

    const result = await service.execute({ from: "2026-03-16", to: "2026-03-22" }, mockUser as any);

    expect(result).toHaveLength(2);
    expect(trainingSessionsRepo.findByPersonalAndDateRange).toHaveBeenCalledWith(
      "personal-1",
      "2026-03-16",
      "2026-03-22",
    );
  });

  it("should return empty array when no sessions exist in range", async () => {
    trainingSessionsRepo.findByPersonalAndDateRange.mockResolvedValue([]);

    const result = await service.execute({ from: "2026-03-16", to: "2026-03-22" }, mockUser as any);

    expect(result).toEqual([]);
  });

  it("should include studentName in the returned sessions", async () => {
    trainingSessionsRepo.findByPersonalAndDateRange.mockResolvedValue([makeSession()]);

    const result = await service.execute({ from: "2026-03-16", to: "2026-03-22" }, mockUser as any);

    expect(result[0].studentName).toBe("João Silva");
  });
});
