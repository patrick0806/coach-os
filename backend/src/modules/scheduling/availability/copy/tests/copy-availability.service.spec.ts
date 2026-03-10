import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CopyAvailabilityService } from "../copy-availability.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const sourceSlots = [
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

describe("CopyAvailabilityService", () => {
  let service: CopyAvailabilityService;
  let availabilityRepository: {
    findByDay: ReturnType<typeof vi.fn>;
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
      findByDay: vi.fn().mockResolvedValue(sourceSlots),
      deleteByDay: vi.fn(),
      createMany: vi.fn().mockResolvedValue(sourceSlots),
    };

    drizzle = {
      db: {
        transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback({})),
      },
    };

    service = new CopyAvailabilityService(availabilityRepository as any, drizzle as any);
  });

  describe("execute", () => {
    it("should copy source slots to all target days replacing previous data", async () => {
      const dto = {
        sourceDayOfWeek: 1,
        targetDays: [2, 4],
      };

      const result = await service.execute(dto, mockCurrentUser);

      expect(availabilityRepository.findByDay).toHaveBeenCalledWith("personal-id", 1);
      expect(drizzle.db.transaction).toHaveBeenCalledTimes(1);
      expect(availabilityRepository.deleteByDay).toHaveBeenCalledTimes(2);
      expect(availabilityRepository.deleteByDay).toHaveBeenCalledWith("personal-id", 2, {});
      expect(availabilityRepository.deleteByDay).toHaveBeenCalledWith("personal-id", 4, {});
      expect(availabilityRepository.createMany).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        copiedToDays: [2, 4],
        totalSlotsCreated: 4,
      });
    });

    it("should remove duplicate target days before copying", async () => {
      await service.execute(
        {
          sourceDayOfWeek: 1,
          targetDays: [2, 2, 3],
        },
        mockCurrentUser,
      );

      expect(availabilityRepository.deleteByDay).toHaveBeenCalledTimes(2);
      expect(availabilityRepository.createMany).toHaveBeenCalledTimes(2);
    });

    it("should throw BadRequestException when targetDays includes sourceDayOfWeek", async () => {
      await expect(
        service.execute(
          {
            sourceDayOfWeek: 1,
            targetDays: [1, 2],
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException when source day has no slots", async () => {
      availabilityRepository.findByDay.mockResolvedValue([]);

      await expect(
        service.execute(
          {
            sourceDayOfWeek: 1,
            targetDays: [2],
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
