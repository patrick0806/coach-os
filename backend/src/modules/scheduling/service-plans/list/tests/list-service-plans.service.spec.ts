import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListServicePlansService } from "../list-service-plans.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPlans = [
  {
    id: "plan-1",
    personalId: "personal-id",
    name: "Plano Básico",
    description: "3x por semana",
    sessionsPerWeek: 3,
    durationMinutes: 60,
    price: "299.90",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("ListServicePlansService", () => {
  let service: ListServicePlansService;
  let servicePlansRepository: { findAllByPersonalId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    servicePlansRepository = { findAllByPersonalId: vi.fn() };
    service = new ListServicePlansService(servicePlansRepository as any);
  });

  describe("execute", () => {
    it("should return all plans for the authenticated personal", async () => {
      servicePlansRepository.findAllByPersonalId.mockResolvedValue(mockPlans);

      const result = await service.execute(mockCurrentUser);

      expect(servicePlansRepository.findAllByPersonalId).toHaveBeenCalledWith("personal-id");
      expect(result).toEqual(mockPlans);
    });

    it("should return empty array when no plans exist", async () => {
      servicePlansRepository.findAllByPersonalId.mockResolvedValue([]);

      const result = await service.execute(mockCurrentUser);

      expect(result).toEqual([]);
    });
  });
});
