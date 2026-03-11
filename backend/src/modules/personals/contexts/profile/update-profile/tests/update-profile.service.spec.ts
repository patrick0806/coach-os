import { describe, it, expect, beforeEach, vi } from "vitest";

import { UpdateProfileService } from "../update-profile.service";

const mockUser = {
  id: "user-id",
  name: "John Doe",
  email: "john@example.com",
  password: "hashed",
  role: "PERSONAL",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPersonal = {
  id: "personal-id",
  userId: "user-id",
  slug: "john-doe",
  bio: null,
  profilePhoto: null,
  themeColor: "#10b981",
  phoneNumber: null,
  lpTitle: null,
  lpSubtitle: null,
  lpHeroImage: null,
  lpAboutTitle: null,
  lpAboutText: null,
  lpImage1: null,
  lpImage2: null,
  lpImage3: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("UpdateProfileService", () => {
  let service: UpdateProfileService;
  let usersRepository: {
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let personalsRepository: {
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let drizzleProvider: {
    db: { transaction: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    usersRepository = { findById: vi.fn(), update: vi.fn() };
    personalsRepository = { findById: vi.fn(), update: vi.fn() };
    drizzleProvider = { db: { transaction: vi.fn() } };

    service = new UpdateProfileService(
      usersRepository as any,
      personalsRepository as any,
      drizzleProvider as any,
    );
  });

  describe("execute", () => {
    it("should update personal fields only", async () => {
      const updatedPersonal = { ...mockPersonal, bio: "New bio" };

      drizzleProvider.db.transaction.mockImplementation(async (cb: any) => {
        personalsRepository.update.mockResolvedValue(updatedPersonal);
        usersRepository.findById.mockResolvedValue(mockUser);
        return cb({});
      });

      const result = await service.execute("personal-id", "user-id", {
        bio: "New bio",
      });

      expect(result.bio).toBe("New bio");
      expect(result.name).toBe("John Doe");
      expect(usersRepository.update).not.toHaveBeenCalled();
    });

    it("should update name in users and personal fields", async () => {
      const updatedUser = { ...mockUser, name: "Jane Doe" };
      const updatedPersonal = { ...mockPersonal, bio: "Updated bio" };

      drizzleProvider.db.transaction.mockImplementation(async (cb: any) => {
        usersRepository.update.mockResolvedValue(updatedUser);
        usersRepository.findById.mockResolvedValue(updatedUser);
        personalsRepository.update.mockResolvedValue(updatedPersonal);
        return cb({});
      });

      const result = await service.execute("personal-id", "user-id", {
        name: "Jane Doe",
        bio: "Updated bio",
      });

      expect(result.name).toBe("Jane Doe");
      expect(result.bio).toBe("Updated bio");
      expect(usersRepository.update).toHaveBeenCalled();
    });

    it("should update only name without personal fields", async () => {
      const updatedUser = { ...mockUser, name: "Jane Doe" };

      drizzleProvider.db.transaction.mockImplementation(async (cb: any) => {
        usersRepository.update.mockResolvedValue(updatedUser);
        personalsRepository.findById.mockResolvedValue(mockPersonal);
        return cb({});
      });

      const result = await service.execute("personal-id", "user-id", {
        name: "Jane Doe",
      });

      expect(result.name).toBe("Jane Doe");
      expect(personalsRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate transaction failures without returning partial data", async () => {
      drizzleProvider.db.transaction.mockRejectedValue(new Error("database unavailable"));

      await expect(
        service.execute("personal-id", "user-id", {
          name: "Jane Doe",
          bio: "Updated bio",
        }),
      ).rejects.toThrow("database unavailable");

      expect(usersRepository.update).not.toHaveBeenCalled();
      expect(personalsRepository.update).not.toHaveBeenCalled();
    });
  });
});
