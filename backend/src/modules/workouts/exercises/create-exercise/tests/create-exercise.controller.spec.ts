import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { CreateExerciseController } from "../create-exercise.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockCreatedResult = {
  id: "new-exercise-id",
  name: "Meu Exercicio",
  description: "Descricao",
  muscleGroup: "peito",
  personalId: "personal-id",
  isGlobal: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("CreateExerciseController", () => {
  let controller: CreateExerciseController;
  let createExerciseService: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    createExerciseService = { execute: vi.fn() };
    controller = new CreateExerciseController(createExerciseService as any);
  });

  describe("handle", () => {
    it("should call service and return created exercise", async () => {
      createExerciseService.execute.mockResolvedValue(mockCreatedResult);

      const dto = { name: "Meu Exercicio", description: "Descricao", muscleGroup: "peito" as const };
      const result = await controller.handle(dto, mockCurrentUser);

      expect(createExerciseService.execute).toHaveBeenCalledWith(dto, mockCurrentUser);
      expect(result).toEqual(mockCreatedResult);
    });
  });
});
