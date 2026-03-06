import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { PortalService } from "../portal.service";

const mockCurrentUser = {
  sub: "personal@example.com",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPersonal = {
  id: "personal-id",
  stripeCustomerId: "cus_123",
  subscriptionStatus: "active",
};

describe("PortalService", () => {
  let service: PortalService;
  let personalsRepository: { findById: ReturnType<typeof vi.fn> };
  let stripeProvider: {
    client: { billingPortal: { sessions: { create: ReturnType<typeof vi.fn> } } };
    isConfigured: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    personalsRepository = { findById: vi.fn() };
    stripeProvider = {
      isConfigured: vi.fn().mockReturnValue(true),
      client: {
        billingPortal: {
          sessions: {
            create: vi.fn().mockResolvedValue({ url: "https://billing.stripe.com/portal/cs_test_123" }),
          },
        },
      },
    };
    service = new PortalService(personalsRepository as any, stripeProvider as any);
  });

  describe("execute", () => {
    it("should return portalUrl when all data is valid", async () => {
      personalsRepository.findById.mockResolvedValue(mockPersonal);

      const result = await service.execute(mockCurrentUser);

      expect(result).toEqual({ portalUrl: "https://billing.stripe.com/portal/cs_test_123" });
    });

    it("should throw NotFoundException when personal not found", async () => {
      personalsRepository.findById.mockResolvedValue(null);

      await expect(service.execute(mockCurrentUser)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when personal has no Stripe customer", async () => {
      personalsRepository.findById.mockResolvedValue({
        ...mockPersonal,
        stripeCustomerId: null,
      });

      await expect(service.execute(mockCurrentUser)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when Stripe is not configured", async () => {
      stripeProvider.isConfigured.mockReturnValue(false);
      personalsRepository.findById.mockResolvedValue(mockPersonal);

      await expect(service.execute(mockCurrentUser)).rejects.toThrow(BadRequestException);
    });
  });
});
