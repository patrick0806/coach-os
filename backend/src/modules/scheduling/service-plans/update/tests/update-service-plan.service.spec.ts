import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UpdateServicePlanService } from "../update-service-plan.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPlan = {
  id: "plan-id",
  personalId: "personal-id",
  name: "Plano Básico",
  description: "3x por semana",
  sessionsPerWeek: 3,
  durationMinutes: 60,
  price: "299.90",
  attendanceType: "presential" as const,
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("UpdateServicePlanService", () => {
  let service: UpdateServicePlanService;
  let servicePlansRepository: {
    findOwnedById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    servicePlansRepository = {
      findOwnedById: vi.fn(),
      update: vi.fn(),
    };
    service = new UpdateServicePlanService(servicePlansRepository as any);
  });

  describe("execute", () => {
    it("should update a service plan", async () => {
      const updated = { ...mockPlan, name: "Plano Premium" };
      servicePlansRepository.findOwnedById.mockResolvedValue(mockPlan);
      servicePlansRepository.update.mockResolvedValue(updated);

      const result = await service.execute("plan-id", { name: "Plano Premium" }, mockCurrentUser);

      expect(servicePlansRepository.findOwnedById).toHaveBeenCalledWith("plan-id", "personal-id");
      expect(servicePlansRepository.update).toHaveBeenCalledWith("plan-id", "personal-id", {
        name: "Plano Premium",
      });
      expect(result.name).toBe("Plano Premium");
    });

    it("should throw NotFoundException when plan does not belong to personal", async () => {
      servicePlansRepository.findOwnedById.mockResolvedValue(null);

      await expect(
        service.execute("other-plan", { name: "Plano" }, mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when sessionsPerWeek is out of range", async () => {
      servicePlansRepository.findOwnedById.mockResolvedValue(mockPlan);

      await expect(
        service.execute("plan-id", { sessionsPerWeek: 0 }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when price is negative", async () => {
      servicePlansRepository.findOwnedById.mockResolvedValue(mockPlan);

      await expect(
        service.execute("plan-id", { price: -50 }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should update attendanceType when provided", async () => {
      const updated = { ...mockPlan, attendanceType: "online" as const };
      servicePlansRepository.findOwnedById.mockResolvedValue(mockPlan);
      servicePlansRepository.update.mockResolvedValue(updated);

      const result = await service.execute(
        "plan-id",
        { attendanceType: "online" },
        mockCurrentUser,
      );

      expect(servicePlansRepository.update).toHaveBeenCalledWith("plan-id", "personal-id", {
        attendanceType: "online",
      });
      expect(result.attendanceType).toBe("online");
    });

    it("should throw BadRequestException for invalid attendanceType", async () => {
      servicePlansRepository.findOwnedById.mockResolvedValue(mockPlan);

      await expect(
        service.execute(
          "plan-id",
          { attendanceType: "invalid" as any },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
