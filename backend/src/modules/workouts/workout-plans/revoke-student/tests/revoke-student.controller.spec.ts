import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { RevokeStudentController } from "../revoke-student.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("RevokeStudentController", () => {
  let controller: RevokeStudentController;
  let revokeStudentService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    revokeStudentService = { execute: vi.fn() };
    controller = new RevokeStudentController(revokeStudentService as any);
  });

  describe("handle", () => {
    it("should call service with planId, studentId and currentUser", async () => {
      revokeStudentService.execute.mockResolvedValue(undefined);

      await controller.handle("plan-id", "student-id", mockCurrentUser);

      expect(revokeStudentService.execute).toHaveBeenCalledWith(
        "plan-id",
        "student-id",
        mockCurrentUser,
      );
    });
  });
});
