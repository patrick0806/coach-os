import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { DeleteAvailabilityService } from "../delete-availability.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockSlot = {
  id: "slot-id",
  personalId: "personal-id",
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "09:00",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("DeleteAvailabilityService", () => {
  let service: DeleteAvailabilityService;
  let availabilityRepository: {
    findOwnedById: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    availabilityRepository = {
      findOwnedById: vi.fn(),
      delete: vi.fn(),
    };
    service = new DeleteAvailabilityService(availabilityRepository as any);
  });

  describe("execute", () => {
    it("should delete a slot owned by the personal", async () => {
      availabilityRepository.findOwnedById.mockResolvedValue(mockSlot);
      availabilityRepository.delete.mockResolvedValue(undefined);

      await service.execute("slot-id", mockCurrentUser);

      expect(availabilityRepository.findOwnedById).toHaveBeenCalledWith("slot-id", "personal-id");
      expect(availabilityRepository.delete).toHaveBeenCalledWith("slot-id", "personal-id");
    });

    it("should throw NotFoundException when slot does not belong to personal", async () => {
      availabilityRepository.findOwnedById.mockResolvedValue(null);

      await expect(service.execute("other-slot", mockCurrentUser)).rejects.toThrow(
        NotFoundException,
      );

      expect(availabilityRepository.delete).not.toHaveBeenCalled();
    });
  });
});
