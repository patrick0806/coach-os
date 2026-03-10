import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { CopyAvailabilityController } from "../copy-availability.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("CopyAvailabilityController", () => {
  let controller: CopyAvailabilityController;
  let copyAvailabilityService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    copyAvailabilityService = { execute: vi.fn() };
    controller = new CopyAvailabilityController(copyAvailabilityService as any);
  });

  describe("handle", () => {
    it("should call service and return copy result", async () => {
      const dto = {
        sourceDayOfWeek: 1,
        targetDays: [2, 3],
      };
      const serviceResponse = {
        copiedToDays: [2, 3],
        totalSlotsCreated: 6,
      };

      copyAvailabilityService.execute.mockResolvedValue(serviceResponse);

      const result = await controller.handle(dto, mockCurrentUser);

      expect(copyAvailabilityService.execute).toHaveBeenCalledWith(dto, mockCurrentUser);
      expect(result).toEqual(serviceResponse);
    });
  });
});
