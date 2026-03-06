import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { AddExerciseController } from "../add-exercise.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockAddedExercise = {
  id: "we-id",
  exerciseId: "exercise-id",
  exerciseName: "Supino Reto",
  muscleGroup: "peito",
  sets: 3,
  repetitions: 12,
  load: null,
  order: 0,
  notes: null,
};

describe("AddExerciseController", () => {
  let controller: AddExerciseController;
  let addExerciseService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    addExerciseService = { execute: vi.fn() };
    controller = new AddExerciseController(addExerciseService as any);
  });

  describe("handle", () => {
    it("should call service with planId, dto and currentUser", async () => {
      addExerciseService.execute.mockResolvedValue(mockAddedExercise);

      const dto = { exerciseId: "exercise-id", sets: 3, repetitions: 12 };
      const result = await controller.handle("plan-id", dto, mockCurrentUser);

      expect(addExerciseService.execute).toHaveBeenCalledWith("plan-id", dto, mockCurrentUser);
      expect(result).toEqual(mockAddedExercise);
    });
  });
});
