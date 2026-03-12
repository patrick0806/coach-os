import { describe, it, expect, vi, beforeEach } from "vitest";

import { ActivityHistoryService } from "../activity-history.service";
import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { IAccessToken } from "@shared/interfaces";
import { ApplicationRoles } from "@shared/enums";

const makeSession = (scheduledDate: string, status: "pending" | "completed" | "cancelled") => ({
  id: "sess-1",
  personalId: "personal-1",
  studentId: "student-1",
  scheduleRuleId: "rule-1",
  workoutPlanId: null,
  workoutSessionId: null,
  scheduledDate,
  scheduledTime: null,
  status,
  sessionType: "online" as const,
  cancelledAt: null,
  cancellationReason: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockUser: IAccessToken = {
  sub: "user-1",
  profileId: "student-1",
  role: ApplicationRoles.STUDENT,
  personalId: "personal-1",
  personalSlug: "john-doe",
};

describe("ActivityHistoryService", () => {
  let service: ActivityHistoryService;
  let repo: TrainingSessionsRepository;

  beforeEach(() => {
    repo = {
      findHistoryByStudent: vi.fn(),
    } as unknown as TrainingSessionsRepository;
    service = new ActivityHistoryService(repo);
  });

  it("should return sessions from the last 84 days", async () => {
    const sessions = [
      makeSession("2026-03-10", "completed"),
      makeSession("2026-03-08", "cancelled"),
    ];
    vi.mocked(repo.findHistoryByStudent).mockResolvedValueOnce(sessions as any);

    const result = await service.execute(mockUser, 84);

    expect(repo.findHistoryByStudent).toHaveBeenCalledWith("student-1", expect.any(String), expect.any(String));
    expect(result).toHaveLength(2);
  });

  it("should use default of 84 days when no days parameter provided", async () => {
    vi.mocked(repo.findHistoryByStudent).mockResolvedValueOnce([]);

    await service.execute(mockUser);

    expect(repo.findHistoryByStudent).toHaveBeenCalled();
  });

  it("should return empty array when no sessions exist", async () => {
    vi.mocked(repo.findHistoryByStudent).mockResolvedValueOnce([]);

    const result = await service.execute(mockUser, 84);

    expect(result).toEqual([]);
  });
});
