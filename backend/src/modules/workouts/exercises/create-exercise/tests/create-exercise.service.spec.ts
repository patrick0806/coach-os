import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CreateExerciseService } from "../create-exercise.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockCreatedExercise = {
  id: "new-exercise-id",
  name: "Meu Exercicio",
  description: "Descricao do exercicio",
  muscleGroup: "peito",
  personalId: "personal-id",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("CreateExerciseService", () => {
  let service: CreateExerciseService;
  let exercisesRepository: {
    create: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    exercisesRepository = { create: vi.fn() };
    service = new CreateExerciseService(exercisesRepository as any);
  });

  describe("execute", () => {
    it("should create an exercise and return it with isGlobal false", async () => {
      exercisesRepository.create.mockResolvedValue(mockCreatedExercise);

      const result = await service.execute(
        { name: "Meu Exercicio", description: "Descricao do exercicio", muscleGroup: "peito" },
        mockCurrentUser,
      );

      expect(exercisesRepository.create).toHaveBeenCalledWith({
        name: "Meu Exercicio",
        description: "Descricao do exercicio",
        muscleGroup: "peito",
        personalId: "personal-id",
      });
      expect(result.isGlobal).toBe(false);
      expect(result.id).toBe("new-exercise-id");
    });

    it("should create exercise without description when not provided", async () => {
      exercisesRepository.create.mockResolvedValue({
        ...mockCreatedExercise,
        description: null,
      });

      await service.execute(
        { name: "Meu Exercicio", muscleGroup: "peito" },
        mockCurrentUser,
      );

      expect(exercisesRepository.create).toHaveBeenCalledWith({
        name: "Meu Exercicio",
        description: undefined,
        muscleGroup: "peito",
        personalId: "personal-id",
      });
    });

    it("should throw BadRequestException for invalid input", async () => {
      await expect(
        service.execute(
          { name: "", muscleGroup: "peito" },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
