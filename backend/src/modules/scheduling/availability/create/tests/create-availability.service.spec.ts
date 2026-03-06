import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, ConflictException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CreateAvailabilityService } from "../create-availability.service";

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

describe("CreateAvailabilityService", () => {
  let service: CreateAvailabilityService;
  let availabilityRepository: {
    create: ReturnType<typeof vi.fn>;
    findConflicting: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    availabilityRepository = {
      create: vi.fn(),
      findConflicting: vi.fn().mockResolvedValue(null),
    };
    service = new CreateAvailabilityService(availabilityRepository as any);
  });

  describe("execute", () => {
    it("should create a new availability slot", async () => {
      availabilityRepository.create.mockResolvedValue(mockSlot);

      const result = await service.execute(
        { dayOfWeek: 1, startTime: "08:00", endTime: "09:00" },
        mockCurrentUser,
      );

      expect(availabilityRepository.create).toHaveBeenCalledWith({
        personalId: "personal-id",
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "09:00",
      });
      expect(result).toEqual(mockSlot);
    });

    it("should throw BadRequestException when startTime equals endTime", async () => {
      await expect(
        service.execute({ dayOfWeek: 1, startTime: "08:00", endTime: "08:00" }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when startTime is after endTime", async () => {
      await expect(
        service.execute({ dayOfWeek: 1, startTime: "10:00", endTime: "08:00" }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when dayOfWeek is out of range", async () => {
      await expect(
        service.execute({ dayOfWeek: 7, startTime: "08:00", endTime: "09:00" }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when dayOfWeek is negative", async () => {
      await expect(
        service.execute({ dayOfWeek: -1, startTime: "08:00", endTime: "09:00" }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when time format is invalid", async () => {
      await expect(
        service.execute({ dayOfWeek: 1, startTime: "8:00", endTime: "09:00" }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw ConflictException when an overlapping slot exists for the same day", async () => {
      availabilityRepository.findConflicting.mockResolvedValue(mockSlot);

      await expect(
        service.execute({ dayOfWeek: 1, startTime: "08:30", endTime: "09:30" }, mockCurrentUser),
      ).rejects.toThrow(ConflictException);
    });

    it("should check for conflicts with the correct parameters", async () => {
      availabilityRepository.create.mockResolvedValue(mockSlot);

      await service.execute({ dayOfWeek: 1, startTime: "08:00", endTime: "09:00" }, mockCurrentUser);

      expect(availabilityRepository.findConflicting).toHaveBeenCalledWith(
        "personal-id",
        1,
        "08:00",
        "09:00",
      );
    });
  });
});
