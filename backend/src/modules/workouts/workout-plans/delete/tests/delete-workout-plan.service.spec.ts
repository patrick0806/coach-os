import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { DeleteWorkoutPlanService } from "../delete-workout-plan.service";

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
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("DeleteWorkoutPlanService", () => {
  let service: DeleteWorkoutPlanService;
  let workoutPlansRepository: {
    findById: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    workoutPlansRepository = { findById: vi.fn(), delete: vi.fn() };
    service = new DeleteWorkoutPlanService(workoutPlansRepository as any);
  });

  describe("execute", () => {
    it("should delete the workout plan when it belongs to the personal", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlan);
      workoutPlansRepository.delete.mockResolvedValue(undefined);

      await service.execute("plan-id", mockCurrentUser);

      expect(workoutPlansRepository.findById).toHaveBeenCalledWith("plan-id", "personal-id");
      expect(workoutPlansRepository.delete).toHaveBeenCalledWith("plan-id", "personal-id");
    });

    it("should throw NotFoundException when plan does not belong to personal", async () => {
      workoutPlansRepository.findById.mockResolvedValue(null);

      await expect(service.execute("other-plan", mockCurrentUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(workoutPlansRepository.delete).not.toHaveBeenCalled();
    });
  });
});
