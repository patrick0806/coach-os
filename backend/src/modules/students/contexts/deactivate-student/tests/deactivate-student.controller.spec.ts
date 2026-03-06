import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { DeactivateStudentController } from "../deactivate-student.controller";
import { DeactivateStudentService } from "../deactivate-student.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("DeactivateStudentController", () => {
  let controller: DeactivateStudentController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new DeactivateStudentController(
      service as unknown as DeactivateStudentService,
    );
  });

  describe("handle", () => {
    it("should deactivate student and return no content", async () => {
      service.execute.mockResolvedValue(undefined);

      await controller.handle("student-id", mockCurrentUser);

      expect(service.execute).toHaveBeenCalledWith("student-id", mockCurrentUser);
    });

    it("should propagate NotFoundException", async () => {
      service.execute.mockRejectedValue(new NotFoundException());

      await expect(
        controller.handle("unknown-id", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
