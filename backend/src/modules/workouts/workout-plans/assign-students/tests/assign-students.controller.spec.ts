import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { AssignStudentsController } from "../assign-students.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("AssignStudentsController", () => {
  let controller: AssignStudentsController;
  let assignStudentsService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    assignStudentsService = { execute: vi.fn() };
    controller = new AssignStudentsController(assignStudentsService as any);
  });

  describe("handle", () => {
    it("should call service with planId, studentIds and currentUser", async () => {
      assignStudentsService.execute.mockResolvedValue(undefined);

      const dto = { studentIds: ["student-id-1", "student-id-2"] };
      await controller.handle("plan-id", dto, mockCurrentUser);

      expect(assignStudentsService.execute).toHaveBeenCalledWith(
        "plan-id",
        dto.studentIds,
        mockCurrentUser,
      );
    });
  });
});
