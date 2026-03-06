import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { DeleteExerciseService } from "../delete-exercise.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockOwnExercise = {
  id: "exercise-own-1",
  name: "Meu Exercicio",
  description: null,
  muscleGroup: "peito",
  personalId: "personal-id",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("DeleteExerciseService", () => {
  let service: DeleteExerciseService;
  let exercisesRepository: {
    findOwnedById: ReturnType<typeof vi.fn>;
    isInUse: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    exercisesRepository = {
      findOwnedById: vi.fn(),
      isInUse: vi.fn(),
      delete: vi.fn(),
    };
    service = new DeleteExerciseService(exercisesRepository as any);
  });

  describe("execute", () => {
    it("should delete an owned exercise successfully", async () => {
      exercisesRepository.findOwnedById.mockResolvedValue(mockOwnExercise);
      exercisesRepository.isInUse.mockResolvedValue(false);
      exercisesRepository.delete.mockResolvedValue(undefined);

      await service.execute("exercise-own-1", mockCurrentUser);

      expect(exercisesRepository.findOwnedById).toHaveBeenCalledWith(
        "exercise-own-1",
        "personal-id",
      );
      expect(exercisesRepository.isInUse).toHaveBeenCalledWith("exercise-own-1");
      expect(exercisesRepository.delete).toHaveBeenCalledWith("exercise-own-1");
    });

    it("should throw NotFoundException when exercise does not belong to the personal", async () => {
      exercisesRepository.findOwnedById.mockResolvedValue(null);

      await expect(service.execute("exercise-other", mockCurrentUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(exercisesRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when exercise is in use by a workout plan", async () => {
      exercisesRepository.findOwnedById.mockResolvedValue(mockOwnExercise);
      exercisesRepository.isInUse.mockResolvedValue(true);

      await expect(service.execute("exercise-own-1", mockCurrentUser)).rejects.toThrow(
        ConflictException,
      );
      expect(exercisesRepository.delete).not.toHaveBeenCalled();
    });
  });
});
