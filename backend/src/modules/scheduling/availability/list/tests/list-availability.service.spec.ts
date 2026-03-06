import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListAvailabilityService } from "../list-availability.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockSlots = [
  {
    id: "slot-1",
    personalId: "personal-id",
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "09:00",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "slot-2",
    personalId: "personal-id",
    dayOfWeek: 3,
    startTime: "10:00",
    endTime: "11:00",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("ListAvailabilityService", () => {
  let service: ListAvailabilityService;
  let availabilityRepository: { findByPersonalId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    availabilityRepository = { findByPersonalId: vi.fn() };
    service = new ListAvailabilityService(availabilityRepository as any);
  });

  describe("execute", () => {
    it("should return all slots for the authenticated personal", async () => {
      availabilityRepository.findByPersonalId.mockResolvedValue(mockSlots);

      const result = await service.execute(mockCurrentUser);

      expect(availabilityRepository.findByPersonalId).toHaveBeenCalledWith("personal-id");
      expect(result).toEqual(mockSlots);
    });

    it("should return empty array when no slots configured", async () => {
      availabilityRepository.findByPersonalId.mockResolvedValue([]);

      const result = await service.execute(mockCurrentUser);

      expect(result).toEqual([]);
    });
  });
});
