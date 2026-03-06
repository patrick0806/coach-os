import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UsageService } from "../usage.service";

const mockCurrentUser = {
  sub: "personal@example.com",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPlan = {
  id: "plan-id",
  name: "Pro",
  description: "Plano Pro",
  price: "29.90",
  highlighted: true,
  order: 1,
  benefits: ["Ate 10 alunos"],
  maxStudents: 10,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPersonal = {
  id: "personal-id",
  userId: "user-id",
  slug: "john-doe",
  subscriptionStatus: "active",
  subscriptionPlanId: "plan-id",
  subscriptionExpiresAt: null,
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
};

describe("UsageService", () => {
  let service: UsageService;
  let personalsRepository: { findById: ReturnType<typeof vi.fn> };
  let plansRepository: { findById: ReturnType<typeof vi.fn> };
  let studentsRepository: { countActiveByPersonal: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    personalsRepository = { findById: vi.fn() };
    plansRepository = { findById: vi.fn() };
    studentsRepository = { countActiveByPersonal: vi.fn() };
    service = new UsageService(
      personalsRepository as any,
      plansRepository as any,
      studentsRepository as any,
    );
  });

  describe("execute", () => {
    it("should return usage data with plan limit", async () => {
      personalsRepository.findById.mockResolvedValue(mockPersonal);
      plansRepository.findById.mockResolvedValue(mockPlan);
      studentsRepository.countActiveByPersonal.mockResolvedValue(4);

      const result = await service.execute(mockCurrentUser);

      expect(result).toEqual({
        studentsUsed: 4,
        studentsLimit: 10,
        planId: "plan-id",
        planName: "Pro",
      });
    });

    it("should return null limit when plan has maxStudents null (unlimited)", async () => {
      personalsRepository.findById.mockResolvedValue(mockPersonal);
      plansRepository.findById.mockResolvedValue({ ...mockPlan, maxStudents: null });
      studentsRepository.countActiveByPersonal.mockResolvedValue(25);

      const result = await service.execute(mockCurrentUser);

      expect(result.studentsLimit).toBeNull();
      expect(result.studentsUsed).toBe(25);
    });

    it("should return null plan info when personal has no subscription", async () => {
      personalsRepository.findById.mockResolvedValue({
        ...mockPersonal,
        subscriptionPlanId: null,
        subscriptionStatus: null,
      });
      studentsRepository.countActiveByPersonal.mockResolvedValue(1);

      const result = await service.execute(mockCurrentUser);

      expect(result.planId).toBeNull();
      expect(result.planName).toBeNull();
      expect(result.studentsLimit).toBeNull();
      expect(result.studentsUsed).toBe(1);
    });

    it("should throw NotFoundException when personal not found", async () => {
      personalsRepository.findById.mockResolvedValue(null);

      await expect(service.execute(mockCurrentUser)).rejects.toThrow(NotFoundException);
    });
  });
});
