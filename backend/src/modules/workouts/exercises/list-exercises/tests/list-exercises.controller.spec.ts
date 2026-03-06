import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListExercisesController } from "../list-exercises.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockExercisesResult = [
  {
    id: "exercise-global-1",
    name: "Supino Reto",
    description: "Supino reto com barra",
    muscleGroup: "peito",
    personalId: null,
    isGlobal: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("ListExercisesController", () => {
  let controller: ListExercisesController;
  let listExercisesService: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    listExercisesService = { execute: vi.fn() };
    controller = new ListExercisesController(listExercisesService as any);
  });

  describe("handle", () => {
    it("should call service with currentUser and empty options when no filters provided", async () => {
      listExercisesService.execute.mockResolvedValue(mockExercisesResult);

      const result = await controller.handle(mockCurrentUser, undefined, undefined);

      expect(listExercisesService.execute).toHaveBeenCalledWith(mockCurrentUser, {
        muscleGroup: undefined,
        search: undefined,
      });
      expect(result).toEqual(mockExercisesResult);
    });

    it("should pass muscleGroup and search when provided", async () => {
      listExercisesService.execute.mockResolvedValue([]);

      await controller.handle(mockCurrentUser, "peito", "supino");

      expect(listExercisesService.execute).toHaveBeenCalledWith(mockCurrentUser, {
        muscleGroup: "peito",
        search: "supino",
      });
    });
  });
});
