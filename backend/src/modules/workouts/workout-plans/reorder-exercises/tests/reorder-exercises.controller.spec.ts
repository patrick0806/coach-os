import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ReorderExercisesController } from "../reorder-exercises.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("ReorderExercisesController", () => {
  let controller: ReorderExercisesController;
  let reorderExercisesService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    reorderExercisesService = { execute: vi.fn() };
    controller = new ReorderExercisesController(reorderExercisesService as any);
  });

  describe("handle", () => {
    it("should call service and return reordered exercises", async () => {
      const mockResult = [
        { id: "we-1", order: 1 },
        { id: "we-2", order: 0 },
      ];
      reorderExercisesService.execute.mockResolvedValue(mockResult);

      const dto = { items: [{ id: "we-1", order: 1 }, { id: "we-2", order: 0 }] };
      const result = await controller.handle("plan-id", dto, mockCurrentUser);

      expect(reorderExercisesService.execute).toHaveBeenCalledWith(
        "plan-id",
        dto.items,
        mockCurrentUser,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
