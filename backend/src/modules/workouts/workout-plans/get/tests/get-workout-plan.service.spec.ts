import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { GetWorkoutPlanService } from "../get-workout-plan.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPlanDetail = {
  id: "plan-id",
  personalId: "personal-id",
  name: "Treino A",
  description: null,
  planKind: "template",
  sourceTemplateId: null,
  studentNames: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  exercises: [
    {
      id: "we-id",
      exerciseId: "exercise-id",
      exerciseName: "Supino Reto",
      muscleGroup: "peito",
      exercisedbGifUrl: null,
      youtubeUrl: null,
      sets: 3,
      repetitions: 12,
      load: "20kg",
      order: 0,
      notes: null,
    },
  ],
};

describe("GetWorkoutPlanService", () => {
  let service: GetWorkoutPlanService;
  let workoutPlansRepository: { findById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    workoutPlansRepository = { findById: vi.fn() };
    service = new GetWorkoutPlanService(workoutPlansRepository as any);
  });

  describe("execute", () => {
    it("should return the workout plan with exercises", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlanDetail);

      const result = await service.execute("plan-id", mockCurrentUser);

      expect(workoutPlansRepository.findById).toHaveBeenCalledWith("plan-id", "personal-id");
      expect(result).toEqual(mockPlanDetail);
    });

    it("should throw NotFoundException when plan does not belong to personal", async () => {
      workoutPlansRepository.findById.mockResolvedValue(null);

      await expect(service.execute("other-plan", mockCurrentUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
