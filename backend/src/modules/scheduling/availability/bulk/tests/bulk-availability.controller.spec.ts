import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { BulkAvailabilityController } from "../bulk-availability.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("BulkAvailabilityController", () => {
  let controller: BulkAvailabilityController;
  let bulkAvailabilityService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bulkAvailabilityService = { execute: vi.fn() };
    controller = new BulkAvailabilityController(bulkAvailabilityService as any);
  });

  describe("handle", () => {
    it("should call service and return bulk availability result", async () => {
      const dto = {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "12:00",
        slotDurationMinutes: 60,
      };
      const serviceResponse = {
        dayOfWeek: 1,
        slotsCreated: 3,
        slots: [],
      };

      bulkAvailabilityService.execute.mockResolvedValue(serviceResponse);

      const result = await controller.handle(dto, mockCurrentUser);

      expect(bulkAvailabilityService.execute).toHaveBeenCalledWith(dto, mockCurrentUser);
      expect(result).toEqual(serviceResponse);
    });
  });
});
