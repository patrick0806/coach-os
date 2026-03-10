import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ApplyTemplateController } from "../apply-template.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("ApplyTemplateController", () => {
  let controller: ApplyTemplateController;
  let applyTemplateService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    applyTemplateService = { execute: vi.fn() };
    controller = new ApplyTemplateController(applyTemplateService as any);
  });

  it("should call service and return created plan", async () => {
    const mockResult = { id: "new-plan-id" };
    applyTemplateService.execute.mockResolvedValue(mockResult);

    const dto = { studentId: "student-id" };
    const result = await controller.handle("template-id", dto, mockCurrentUser);

    expect(applyTemplateService.execute).toHaveBeenCalledWith(
      "template-id",
      dto,
      mockCurrentUser,
    );
    expect(result).toEqual(mockResult);
  });
});
