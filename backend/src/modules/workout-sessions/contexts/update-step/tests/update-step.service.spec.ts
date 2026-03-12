import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UpdateStepService } from "../update-step.service";

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
  currentStep: 0,
  startedAt: new Date("2024-01-01"),
  completedAt: null,
};

describe("UpdateStepService", () => {
  let service: UpdateStepService;
  let workoutSessionsRepository: {
    findByIdAndStudent: ReturnType<typeof vi.fn>;
    updateStep: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    workoutSessionsRepository = {
      findByIdAndStudent: vi.fn(),
      updateStep: vi.fn(),
    };
    service = new UpdateStepService(workoutSessionsRepository as any);
  });

  describe("execute", () => {
    it("should update the current step of a session", async () => {
      const updated = { ...mockSession, currentStep: 3 };
      workoutSessionsRepository.findByIdAndStudent.mockResolvedValue(mockSession);
      workoutSessionsRepository.updateStep.mockResolvedValue(updated);

      const result = await service.execute("session-id", { currentStep: 3 }, mockCurrentUser);

      expect(workoutSessionsRepository.updateStep).toHaveBeenCalledWith(
        "session-id",
        "student-id",
        3,
      );
      expect(result.currentStep).toBe(3);
    });

    it("should throw NotFoundException when session does not exist", async () => {
      workoutSessionsRepository.findByIdAndStudent.mockResolvedValue(null);

      await expect(
        service.execute("session-id", { currentStep: 1 }, mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when currentStep is negative", async () => {
      await expect(
        service.execute("session-id", { currentStep: -1 }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
