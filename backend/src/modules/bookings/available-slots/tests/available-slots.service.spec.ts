import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { AvailableSlotsService } from "../available-slots.service";

// Student JWT: personalId = coach's ID (tenant), profileId = student's ID
const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.STUDENT,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "student-id",
};

const mockAvailabilitySlots = [
  { id: "slot-1", startTime: "08:00", endTime: "09:00", dayOfWeek: 1 },
  { id: "slot-2", startTime: "10:00", endTime: "11:00", dayOfWeek: 1 },
  { id: "slot-3", startTime: "14:00", endTime: "15:00", dayOfWeek: 1 },
];

describe("AvailableSlotsService", () => {
  let service: AvailableSlotsService;
  let bookingsRepository: { findAvailableSlots: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bookingsRepository = { findAvailableSlots: vi.fn() };
    service = new AvailableSlotsService(bookingsRepository as any);
  });

  describe("execute", () => {
    it("should return available slots for a given date", async () => {
      bookingsRepository.findAvailableSlots.mockResolvedValue(mockAvailabilitySlots);

      const result = await service.execute("2024-01-15", mockCurrentUser);

      // 2024-01-15 is a Monday (dayOfWeek = 1)
      expect(bookingsRepository.findAvailableSlots).toHaveBeenCalledWith(
        "personal-id",
        "2024-01-15",
        1,
      );
      expect(result).toEqual(mockAvailabilitySlots);
    });

    it("should return empty array when no slots available", async () => {
      bookingsRepository.findAvailableSlots.mockResolvedValue([]);

      const result = await service.execute("2024-01-15", mockCurrentUser);

      expect(result).toEqual([]);
    });
  });
});
