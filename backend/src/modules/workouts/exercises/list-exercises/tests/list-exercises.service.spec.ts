import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListExercisesService } from "../list-exercises.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockExercises = [
  {
    id: "exercise-global-1",
    name: "Supino Reto",
    description: "Supino reto com barra",
    muscleGroup: "peito",
    personalId: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "exercise-own-1",
    name: "Meu Exercicio",
    description: "Exercicio customizado",
    muscleGroup: "peito",
    personalId: "personal-id",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("ListExercisesService", () => {
  let service: ListExercisesService;
  let exercisesRepository: {
    findAll: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    exercisesRepository = { findAll: vi.fn() };
    service = new ListExercisesService(exercisesRepository as any);
  });

  describe("execute", () => {
    it("should return exercises with isGlobal flag for the authenticated personal", async () => {
      exercisesRepository.findAll.mockResolvedValue(mockExercises);

      const result = await service.execute(mockCurrentUser, {});

      expect(exercisesRepository.findAll).toHaveBeenCalledWith("personal-id", {});
      expect(result).toHaveLength(2);
      expect(result[0].isGlobal).toBe(true);
      expect(result[1].isGlobal).toBe(false);
    });

    it("should pass muscleGroup filter when provided", async () => {
      exercisesRepository.findAll.mockResolvedValue([mockExercises[0]]);

      await service.execute(mockCurrentUser, { muscleGroup: "peito" });

      expect(exercisesRepository.findAll).toHaveBeenCalledWith("personal-id", {
        muscleGroup: "peito",
      });
    });

    it("should pass search filter when provided", async () => {
      exercisesRepository.findAll.mockResolvedValue([mockExercises[0]]);

      await service.execute(mockCurrentUser, { search: "supino" });

      expect(exercisesRepository.findAll).toHaveBeenCalledWith("personal-id", {
        search: "supino",
      });
    });

    it("should return empty array when no exercises found", async () => {
      exercisesRepository.findAll.mockResolvedValue([]);

      const result = await service.execute(mockCurrentUser, {});

      expect(result).toEqual([]);
    });
  });
});
