import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CreateServicePlanService } from "../create-service-plan.service";

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
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("CreateServicePlanService", () => {
  let service: CreateServicePlanService;
  let servicePlansRepository: { create: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    servicePlansRepository = { create: vi.fn() };
    service = new CreateServicePlanService(servicePlansRepository as any);
  });

  describe("execute", () => {
    it("should create a new service plan", async () => {
      servicePlansRepository.create.mockResolvedValue(mockPlan);

      const result = await service.execute(
        {
          name: "Plano Básico",
          description: "3x por semana",
          sessionsPerWeek: 3,
          durationMinutes: 60,
          price: 299.9,
        },
        mockCurrentUser,
      );

      expect(servicePlansRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          personalId: "personal-id",
          name: "Plano Básico",
          sessionsPerWeek: 3,
        }),
      );
      expect(result).toEqual(mockPlan);
    });

    it("should throw BadRequestException when name is missing", async () => {
      await expect(
        service.execute({ name: "", sessionsPerWeek: 3, price: 299.9 } as any, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when sessionsPerWeek is out of range", async () => {
      await expect(
        service.execute({ name: "Plano", sessionsPerWeek: 8, price: 299.9 }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when price is negative", async () => {
      await expect(
        service.execute({ name: "Plano", sessionsPerWeek: 3, price: -10 }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should use default durationMinutes when not provided", async () => {
      servicePlansRepository.create.mockResolvedValue(mockPlan);

      await service.execute({ name: "Plano", sessionsPerWeek: 3, price: 299.9 }, mockCurrentUser);

      expect(servicePlansRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ durationMinutes: 60 }),
      );
    });
  });
});
