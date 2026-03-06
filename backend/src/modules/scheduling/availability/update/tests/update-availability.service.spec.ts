import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UpdateAvailabilityService } from "../update-availability.service";

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

describe("UpdateAvailabilityService", () => {
  let service: UpdateAvailabilityService;
  let availabilityRepository: {
    findOwnedById: ReturnType<typeof vi.fn>;
    findConflicting: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    availabilityRepository = {
      findOwnedById: vi.fn(),
      findConflicting: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    };
    service = new UpdateAvailabilityService(availabilityRepository as any);
  });

  describe("execute", () => {
    it("should update startTime and endTime", async () => {
      const updated = { ...mockSlot, startTime: "09:00", endTime: "10:00" };
      availabilityRepository.findOwnedById.mockResolvedValue(mockSlot);
      availabilityRepository.update.mockResolvedValue(updated);

      const result = await service.execute(
        "slot-id",
        { startTime: "09:00", endTime: "10:00" },
        mockCurrentUser,
      );

      expect(availabilityRepository.findOwnedById).toHaveBeenCalledWith("slot-id", "personal-id");
      expect(availabilityRepository.update).toHaveBeenCalledWith("slot-id", "personal-id", {
        startTime: "09:00",
        endTime: "10:00",
      });
      expect(result).toEqual(updated);
    });

    it("should toggle isActive", async () => {
      const updated = { ...mockSlot, isActive: false };
      availabilityRepository.findOwnedById.mockResolvedValue(mockSlot);
      availabilityRepository.update.mockResolvedValue(updated);

      const result = await service.execute("slot-id", { isActive: false }, mockCurrentUser);

      expect(result.isActive).toBe(false);
    });

    it("should throw NotFoundException when slot does not belong to personal", async () => {
      availabilityRepository.findOwnedById.mockResolvedValue(null);

      await expect(
        service.execute("other-slot", { isActive: false }, mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when startTime equals endTime", async () => {
      availabilityRepository.findOwnedById.mockResolvedValue(mockSlot);

      await expect(
        service.execute("slot-id", { startTime: "08:00", endTime: "08:00" }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when startTime is after endTime", async () => {
      availabilityRepository.findOwnedById.mockResolvedValue(mockSlot);

      await expect(
        service.execute("slot-id", { startTime: "10:00", endTime: "08:00" }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should use existing times when only one side is updated", async () => {
      const updated = { ...mockSlot, endTime: "10:00" };
      availabilityRepository.findOwnedById.mockResolvedValue(mockSlot);
      availabilityRepository.update.mockResolvedValue(updated);

      // Only endTime provided — should combine with existing startTime "08:00"
      const result = await service.execute("slot-id", { endTime: "10:00" }, mockCurrentUser);

      expect(result.endTime).toBe("10:00");
      expect(availabilityRepository.update).toHaveBeenCalled();
    });

    it("should throw ConflictException when updated time overlaps with another slot", async () => {
      const conflictingSlot = { ...mockSlot, id: "other-slot-id", startTime: "09:00", endTime: "10:00" };
      availabilityRepository.findOwnedById.mockResolvedValue(mockSlot);
      availabilityRepository.findConflicting.mockResolvedValue(conflictingSlot);

      await expect(
        service.execute("slot-id", { startTime: "08:30", endTime: "09:30" }, mockCurrentUser),
      ).rejects.toThrow(ConflictException);
    });

    it("should not check conflicts when only isActive is updated", async () => {
      const updated = { ...mockSlot, isActive: false };
      availabilityRepository.findOwnedById.mockResolvedValue(mockSlot);
      availabilityRepository.update.mockResolvedValue(updated);

      await service.execute("slot-id", { isActive: false }, mockCurrentUser);

      expect(availabilityRepository.findConflicting).not.toHaveBeenCalled();
    });

    it("should pass excludeId when checking conflicts on update", async () => {
      const updated = { ...mockSlot, startTime: "09:00", endTime: "10:00" };
      availabilityRepository.findOwnedById.mockResolvedValue(mockSlot);
      availabilityRepository.update.mockResolvedValue(updated);

      await service.execute("slot-id", { startTime: "09:00", endTime: "10:00" }, mockCurrentUser);

      expect(availabilityRepository.findConflicting).toHaveBeenCalledWith(
        "personal-id",
        1,
        "09:00",
        "10:00",
        "slot-id",
      );
    });
  });
});
