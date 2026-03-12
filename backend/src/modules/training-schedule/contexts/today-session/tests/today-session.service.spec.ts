import { describe, it, expect, beforeEach, vi } from "vitest";
import { TodaySessionService } from "../today-session.service";

const mockUser = { sub: "user-1", role: "STUDENT", profileId: "student-1", personalId: "personal-1", personalSlug: "coach" };

const makeSession = (overrides = {}) => ({
  id: "session-1",
  studentId: "student-1",
  personalId: "personal-1",
  scheduleRuleId: "rule-1",
  workoutPlanId: "wp-1",
  workoutSessionId: null,
  scheduledDate: "2026-03-12",
  startTime: null,
  endTime: null,
  status: "pending",
  sessionType: "online",
  cancelledAt: null,
  cancellationReason: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("TodaySessionService", () => {
  let service: TodaySessionService;
  let trainingSessionsRepo: { findTodayByStudent: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    trainingSessionsRepo = { findTodayByStudent: vi.fn() };
    service = new TodaySessionService(trainingSessionsRepo as any);
  });

  it("should return the session for today", async () => {
    const session = makeSession();
    trainingSessionsRepo.findTodayByStudent.mockResolvedValue(session);

    const result = await service.execute(mockUser as any);

    expect(result).toEqual(session);
    expect(trainingSessionsRepo.findTodayByStudent).toHaveBeenCalledWith("student-1", "personal-1");
  });

  it("should return null when there is no session today", async () => {
    trainingSessionsRepo.findTodayByStudent.mockResolvedValue(null);

    const result = await service.execute(mockUser as any);

    expect(result).toBeNull();
  });
});
