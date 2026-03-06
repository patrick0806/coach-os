import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { RemoveExerciseService } from "../remove-exercise.service";

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

describe("RemoveExerciseService", () => {
  let service: RemoveExerciseService;
  let workoutPlansRepository: { findById: ReturnType<typeof vi.fn> };
  let workoutExercisesRepository: { deleteById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    workoutPlansRepository = { findById: vi.fn() };
    workoutExercisesRepository = { deleteById: vi.fn() };
    service = new RemoveExerciseService(
      workoutPlansRepository as any,
      workoutExercisesRepository as any,
    );
  });

  describe("execute", () => {
    it("should remove an exercise from the workout plan", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlan);
      workoutExercisesRepository.deleteById.mockResolvedValue(undefined);

      await service.execute("plan-id", "we-id", mockCurrentUser);

      expect(workoutPlansRepository.findById).toHaveBeenCalledWith("plan-id", "personal-id");
      expect(workoutExercisesRepository.deleteById).toHaveBeenCalledWith("we-id", "plan-id");
    });

    it("should throw NotFoundException when plan does not belong to personal", async () => {
      workoutPlansRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("other-plan", "we-id", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
      expect(workoutExercisesRepository.deleteById).not.toHaveBeenCalled();
    });
  });
});
