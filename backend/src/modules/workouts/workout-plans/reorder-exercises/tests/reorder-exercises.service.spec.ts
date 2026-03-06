import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { ReorderExercisesService } from "../reorder-exercises.service";

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
  exercises: [
    { id: "we-1", order: 0 },
    { id: "we-2", order: 1 },
  ],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockReorderedExercises = [
  { id: "we-1", order: 1 },
  { id: "we-2", order: 0 },
];

describe("ReorderExercisesService", () => {
  let service: ReorderExercisesService;
  let workoutPlansRepository: { findById: ReturnType<typeof vi.fn> };
  let workoutExercisesRepository: {
    reorder: ReturnType<typeof vi.fn>;
    findByWorkoutPlanId: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    workoutPlansRepository = { findById: vi.fn() };
    workoutExercisesRepository = {
      reorder: vi.fn(),
      findByWorkoutPlanId: vi.fn(),
    };
    service = new ReorderExercisesService(
      workoutPlansRepository as any,
      workoutExercisesRepository as any,
    );
  });

  describe("execute", () => {
    it("should reorder exercises and return updated list", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlan);
      workoutExercisesRepository.reorder.mockResolvedValue(undefined);
      workoutExercisesRepository.findByWorkoutPlanId.mockResolvedValue(mockReorderedExercises);

      const items = [
        { id: "we-1", order: 1 },
        { id: "we-2", order: 0 },
      ];
      const result = await service.execute("plan-id", items, mockCurrentUser);

      expect(workoutPlansRepository.findById).toHaveBeenCalledWith("plan-id", "personal-id");
      expect(workoutExercisesRepository.reorder).toHaveBeenCalledWith(items);
      expect(workoutExercisesRepository.findByWorkoutPlanId).toHaveBeenCalledWith("plan-id");
      expect(result).toEqual(mockReorderedExercises);
    });

    it("should throw NotFoundException when plan does not belong to personal", async () => {
      workoutPlansRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("other-plan", [{ id: "we-1", order: 0 }], mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
