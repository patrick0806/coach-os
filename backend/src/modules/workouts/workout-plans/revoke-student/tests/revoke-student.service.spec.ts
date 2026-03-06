import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { RevokeStudentService } from "../revoke-student.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPlan = {
  id: "plan-id",
  personalId: "personal-id",
  name: "Treino A",
  description: null,
  exercises: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("RevokeStudentService", () => {
  let service: RevokeStudentService;
  let workoutPlansRepository: { findById: ReturnType<typeof vi.fn> };
  let workoutPlanStudentsRepository: { revoke: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    workoutPlansRepository = { findById: vi.fn() };
    workoutPlanStudentsRepository = { revoke: vi.fn() };
    service = new RevokeStudentService(
      workoutPlansRepository as any,
      workoutPlanStudentsRepository as any,
    );
  });

  describe("execute", () => {
    it("should revoke a student assignment from a workout plan", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlan);
      workoutPlanStudentsRepository.revoke.mockResolvedValue(undefined);

      await service.execute("plan-id", "student-id", mockCurrentUser);

      expect(workoutPlansRepository.findById).toHaveBeenCalledWith("plan-id", "personal-id");
      expect(workoutPlanStudentsRepository.revoke).toHaveBeenCalledWith("plan-id", "student-id");
    });

    it("should throw NotFoundException when plan does not belong to personal", async () => {
      workoutPlansRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("other-plan", "student-id", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
      expect(workoutPlanStudentsRepository.revoke).not.toHaveBeenCalled();
    });
  });
});
