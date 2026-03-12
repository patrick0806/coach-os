import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { AddExerciseService } from "../add-exercise.service";

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

const VALID_EXERCISE_UUID = "550e8400-e29b-41d4-a716-446655440000";

const mockAddedExercise = {
  id: "we-id",
  exerciseId: VALID_EXERCISE_UUID,
  exerciseName: "Supino Reto",
  muscleGroup: "peito",
  sets: 3,
  repetitions: 12,
  load: "20kg",
  restTime: null,
  executionTime: null,
  order: 0,
  notes: null,
};

describe("AddExerciseService", () => {
  let service: AddExerciseService;
  let workoutPlansRepository: { findById: ReturnType<typeof vi.fn> };
  let workoutExercisesRepository: { create: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    workoutPlansRepository = { findById: vi.fn() };
    workoutExercisesRepository = { create: vi.fn() };
    service = new AddExerciseService(
      workoutPlansRepository as any,
      workoutExercisesRepository as any,
    );
  });

  describe("execute", () => {
    it("should add an exercise to the workout plan", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlan);
      workoutExercisesRepository.create.mockResolvedValue(mockAddedExercise);

      const dto = { exerciseId: VALID_EXERCISE_UUID, sets: 3, repetitions: 12, load: "20kg" };
      const result = await service.execute("plan-id", dto, mockCurrentUser);

      expect(workoutPlansRepository.findById).toHaveBeenCalledWith("plan-id", "personal-id");
      expect(workoutExercisesRepository.create).toHaveBeenCalledWith({
        workoutPlanId: "plan-id",
        exerciseId: VALID_EXERCISE_UUID,
        sets: 3,
        repetitions: 12,
        load: "20kg",
        restTime: undefined,
        executionTime: undefined,
        order: 0,
        notes: undefined,
      });
      expect(result).toEqual(mockAddedExercise);
    });

    it("should persist restTime and executionTime when provided", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlan);
      workoutExercisesRepository.create.mockResolvedValue({
        ...mockAddedExercise,
        restTime: "60s",
        executionTime: "3s",
      });

      await service.execute(
        "plan-id",
        { exerciseId: VALID_EXERCISE_UUID, sets: 3, repetitions: 12, restTime: "60s", executionTime: "3s" },
        mockCurrentUser,
      );

      expect(workoutExercisesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ restTime: "60s", executionTime: "3s" }),
      );
    });

    it("should throw NotFoundException when plan does not belong to personal", async () => {
      workoutPlansRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("other-plan", { exerciseId: VALID_EXERCISE_UUID, sets: 3, repetitions: 12 }, mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException for invalid input", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlan);

      await expect(
        service.execute("plan-id", { exerciseId: "", sets: 0, repetitions: 12 }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
