import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { BulkAvailabilityService } from "../bulk-availability.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const createdSlots = [
  {
    id: "slot-1",
    personalId: "personal-id",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "10:00",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "slot-2",
    personalId: "personal-id",
    dayOfWeek: 1,
    startTime: "10:00",
    endTime: "11:00",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("BulkAvailabilityService", () => {
  let service: BulkAvailabilityService;
  let availabilityRepository: {
    deleteByDay: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
  };
  let drizzle: {
    db: {
      transaction: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    availabilityRepository = {
      deleteByDay: vi.fn(),
      createMany: vi.fn().mockResolvedValue(createdSlots),
    };

    drizzle = {
      db: {
        transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback({})),
      },
    };

    service = new BulkAvailabilityService(availabilityRepository as any, drizzle as any);
  });

  describe("execute", () => {
    it("should replace slots of the day and create generated slots", async () => {
      const dto = {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "11:00",
        slotDurationMinutes: 60,
      };

      const result = await service.execute(dto, mockCurrentUser);

      expect(drizzle.db.transaction).toHaveBeenCalledTimes(1);
      expect(availabilityRepository.deleteByDay).toHaveBeenCalledWith("personal-id", 1, {});
      expect(availabilityRepository.createMany).toHaveBeenCalledWith(
        [
          { personalId: "personal-id", dayOfWeek: 1, startTime: "09:00", endTime: "10:00" },
          { personalId: "personal-id", dayOfWeek: 1, startTime: "10:00", endTime: "11:00" },
        ],
        {},
      );
      expect(result).toEqual({
        dayOfWeek: 1,
        slotsCreated: 2,
        slots: createdSlots,
      });
    });

    it("should skip slots that overlap the break interval", async () => {
      const dto = {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "13:00",
        slotDurationMinutes: 60,
        breakStart: "11:00",
        breakEnd: "12:00",
      };

      await service.execute(dto, mockCurrentUser);

      expect(availabilityRepository.createMany).toHaveBeenCalledWith(
        [
          { personalId: "personal-id", dayOfWeek: 1, startTime: "09:00", endTime: "10:00" },
          { personalId: "personal-id", dayOfWeek: 1, startTime: "10:00", endTime: "11:00" },
          { personalId: "personal-id", dayOfWeek: 1, startTime: "12:00", endTime: "13:00" },
        ],
        {},
      );
    });

    it("should throw BadRequestException when breakStart is provided without breakEnd", async () => {
      await expect(
        service.execute(
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "11:00",
            slotDurationMinutes: 60,
            breakStart: "10:00",
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when break is outside work interval", async () => {
      await expect(
        service.execute(
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "11:00",
            slotDurationMinutes: 60,
            breakStart: "08:00",
            breakEnd: "09:30",
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when no slot can be generated", async () => {
      await expect(
        service.execute(
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "09:30",
            slotDurationMinutes: 60,
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
