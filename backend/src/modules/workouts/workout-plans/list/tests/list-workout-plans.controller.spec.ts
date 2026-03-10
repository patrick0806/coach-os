import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListWorkoutPlansController } from "../list-workout-plans.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("ListWorkoutPlansController", () => {
  let controller: ListWorkoutPlansController;
  let listWorkoutPlansService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    listWorkoutPlansService = { execute: vi.fn() };
    controller = new ListWorkoutPlansController(listWorkoutPlansService as any);
  });

  describe("handle", () => {
    it("should call service with default page/size and return result", async () => {
      const mockResult = { content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 };
      listWorkoutPlansService.execute.mockResolvedValue(mockResult);

      const result = await controller.handle(mockCurrentUser, undefined, 1, 10);

      expect(listWorkoutPlansService.execute).toHaveBeenCalledWith(mockCurrentUser, {
        page: 1,
        size: 10,
      });
      expect(result).toEqual(mockResult);
    });

    it("should pass kind when provided", async () => {
      const mockResult = { content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 };
      listWorkoutPlansService.execute.mockResolvedValue(mockResult);

      await controller.handle(mockCurrentUser, "student", 1, 10);

      expect(listWorkoutPlansService.execute).toHaveBeenCalledWith(mockCurrentUser, {
        kind: "student",
        page: 1,
        size: 10,
      });
    });
  });
});
