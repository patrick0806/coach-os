import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CompleteSessionService } from "../complete-session.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.STUDENT,
  profileId: "student-id",
  personalId: "personal-id",
  personalSlug: "john-doe",
};

const mockSession = {
  id: "session-id",
  studentId: "student-id",
  workoutPlanId: "plan-id",
  status: "active",
  currentStep: 5,
  startedAt: new Date("2024-01-01"),
  completedAt: null,
};

describe("CompleteSessionService", () => {
  let service: CompleteSessionService;
  let workoutSessionsRepository: {
    findByIdAndStudent: ReturnType<typeof vi.fn>;
    complete: ReturnType<typeof vi.fn>;
  };
  let streakService: { updateStudentStats: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    workoutSessionsRepository = {
      findByIdAndStudent: vi.fn(),
      complete: vi.fn(),
    };
    streakService = { updateStudentStats: vi.fn().mockResolvedValue(undefined) };
    service = new CompleteSessionService(workoutSessionsRepository as any, streakService as any);
  });

  describe("execute", () => {
    it("should complete the session and set completedAt", async () => {
      const completedAt = new Date();
      const completed = { ...mockSession, status: "completed", completedAt };
      workoutSessionsRepository.findByIdAndStudent.mockResolvedValue(mockSession);
      workoutSessionsRepository.complete.mockResolvedValue(completed);

      const result = await service.execute("session-id", mockCurrentUser);

      expect(workoutSessionsRepository.complete).toHaveBeenCalledWith(
        "session-id",
        "student-id",
      );
      expect(result.status).toBe("completed");
      expect(result.completedAt).toEqual(completedAt);
    });

    it("should throw NotFoundException when session does not exist", async () => {
      workoutSessionsRepository.findByIdAndStudent.mockResolvedValue(null);

      await expect(
        service.execute("session-id", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
