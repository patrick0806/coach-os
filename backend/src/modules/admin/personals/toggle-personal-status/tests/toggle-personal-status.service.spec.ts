import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { TogglePersonalStatusService } from "../toggle-personal-status.service";

const mockPersonal = {
  id: "personal-1",
  userId: "user-1",
  slug: "john-doe",
};

describe("TogglePersonalStatusService", () => {
  let service: TogglePersonalStatusService;
  let personalsRepository: { findById: ReturnType<typeof vi.fn> };
  let usersRepository: { update: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    personalsRepository = { findById: vi.fn() };
    usersRepository = { update: vi.fn().mockResolvedValue({ id: "user-1", isActive: false }) };
    service = new TogglePersonalStatusService(personalsRepository as any, usersRepository as any);
  });

  describe("execute", () => {
    it("should activate personal account", async () => {
      personalsRepository.findById.mockResolvedValue(mockPersonal);

      await service.execute("personal-1", true);

      expect(usersRepository.update).toHaveBeenCalledWith("user-1", { isActive: true });
    });

    it("should deactivate personal account", async () => {
      personalsRepository.findById.mockResolvedValue(mockPersonal);

      await service.execute("personal-1", false);

      expect(usersRepository.update).toHaveBeenCalledWith("user-1", { isActive: false });
    });

    it("should throw NotFoundException when personal not found", async () => {
      personalsRepository.findById.mockResolvedValue(null);

      await expect(service.execute("nonexistent", false)).rejects.toThrow(NotFoundException);
    });
  });
});
