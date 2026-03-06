import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { DeactivateServicePlanService } from "../deactivate-service-plan.service";

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
  description: null,
  sessionsPerWeek: 3,
  durationMinutes: 60,
  price: "299.90",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("DeactivateServicePlanService", () => {
  let service: DeactivateServicePlanService;
  let servicePlansRepository: {
    findOwnedById: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    servicePlansRepository = {
      findOwnedById: vi.fn(),
      deactivate: vi.fn(),
    };
    service = new DeactivateServicePlanService(servicePlansRepository as any);
  });

  describe("execute", () => {
    it("should deactivate a service plan", async () => {
      servicePlansRepository.findOwnedById.mockResolvedValue(mockPlan);
      servicePlansRepository.deactivate.mockResolvedValue(undefined);

      await service.execute("plan-id", mockCurrentUser);

      expect(servicePlansRepository.findOwnedById).toHaveBeenCalledWith("plan-id", "personal-id");
      expect(servicePlansRepository.deactivate).toHaveBeenCalledWith("plan-id", "personal-id");
    });

    it("should throw NotFoundException when plan does not belong to personal", async () => {
      servicePlansRepository.findOwnedById.mockResolvedValue(null);

      await expect(service.execute("other-plan", mockCurrentUser)).rejects.toThrow(
        NotFoundException,
      );

      expect(servicePlansRepository.deactivate).not.toHaveBeenCalled();
    });
  });
});
