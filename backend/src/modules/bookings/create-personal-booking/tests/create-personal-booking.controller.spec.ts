import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { CreatePersonalBookingController } from "../create-personal-booking.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("CreatePersonalBookingController", () => {
  let controller: CreatePersonalBookingController;
  let createPersonalBookingService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    createPersonalBookingService = { execute: vi.fn() };
    controller = new CreatePersonalBookingController(createPersonalBookingService as any);
  });

  describe("handle", () => {
    it("should call service and return created booking", async () => {
      const dto = {
        studentId: "550e8400-e29b-41d4-a716-446655440001",
        servicePlanId: "550e8400-e29b-41d4-a716-446655440000",
        scheduledDate: "2024-01-15",
        startTime: "08:00",
        endTime: "09:00",
      };
      const booking = { id: "booking-id" };
      createPersonalBookingService.execute.mockResolvedValue(booking);

      const result = await controller.handle(dto, mockCurrentUser);

      expect(createPersonalBookingService.execute).toHaveBeenCalledWith(dto, mockCurrentUser);
      expect(result).toEqual(booking);
    });
  });
});
