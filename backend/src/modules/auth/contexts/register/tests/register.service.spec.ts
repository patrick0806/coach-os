import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";

import { RegisterService } from "../register.service";

const mockUser = {
  id: "user-id",
  name: "John Doe",
  email: "john@example.com",
  role: "PERSONAL",
  isActive: true,
  password: "hashed-password",
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

describe("RegisterService", () => {
  let service: RegisterService;
  let usersRepository: {
    findByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let personalsRepository: {
    findBySlug: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let plansRepository: {
    findAllActive: ReturnType<typeof vi.fn>;
  };
  let drizzleProvider: {
    db: { transaction: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    usersRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    personalsRepository = {
      findBySlug: vi.fn(),
      create: vi.fn(),
    };
    plansRepository = {
      findAllActive: vi.fn(),
    };
    drizzleProvider = {
      db: {
        transaction: vi.fn(),
      },
    };

    service = new RegisterService(
      usersRepository as any,
      personalsRepository as any,
      plansRepository as any,
      drizzleProvider as any,
    );
  });

  describe("execute", () => {
    it("should register a personal trainer successfully", async () => {
      const dto = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      usersRepository.findByEmail.mockResolvedValue(null);
      personalsRepository.findBySlug.mockResolvedValue(null);
      plansRepository.findAllActive.mockResolvedValue([
        { id: "plan-basico-id", name: "Basico" },
      ]);

      drizzleProvider.db.transaction.mockImplementation(async (cb: any) => {
        usersRepository.create.mockResolvedValue(mockUser);
        personalsRepository.create.mockResolvedValue(mockPersonal);
        return cb({});
      });

      const result = await service.execute(dto);

      expect(result).toEqual({
        id: "user-id",
        name: "John Doe",
        email: "john@example.com",
        role: "PERSONAL",
        profile: {
          id: "personal-id",
          slug: "john-doe",
        },
      });

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        "john@example.com",
      );
      expect(drizzleProvider.db.transaction).toHaveBeenCalled();
    });

    it("should throw ConflictException when email already exists", async () => {
      const dto = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      usersRepository.findByEmail.mockResolvedValue({ id: "existing-id" });

      await expect(service.execute(dto)).rejects.toThrow(ConflictException);
      expect(drizzleProvider.db.transaction).not.toHaveBeenCalled();
    });

    it("should generate slug with suffix when base slug already exists", async () => {
      const dto = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      usersRepository.findByEmail.mockResolvedValue(null);
      // first call (base slug) returns existing, second call (slug-2) returns null
      personalsRepository.findBySlug
        .mockResolvedValueOnce({ slug: "john-doe" })
        .mockResolvedValueOnce(null);
      plansRepository.findAllActive.mockResolvedValue([
        { id: "plan-basico-id", name: "Basico" },
      ]);

      drizzleProvider.db.transaction.mockImplementation(async (cb: any) => {
        usersRepository.create.mockResolvedValue(mockUser);
        personalsRepository.create.mockResolvedValue({
          ...mockPersonal,
          slug: "john-doe-2",
        });
        return cb({});
      });

      const result = await service.execute(dto);

      expect(result.profile.slug).toBe("john-doe-2");
      expect(personalsRepository.findBySlug).toHaveBeenCalledTimes(2);
    });

    it("should throw when database transaction fails", async () => {
      const dto = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      usersRepository.findByEmail.mockResolvedValue(null);
      personalsRepository.findBySlug.mockResolvedValue(null);
      plansRepository.findAllActive.mockResolvedValue([
        { id: "plan-basico-id", name: "Basico" },
      ]);
      drizzleProvider.db.transaction.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(service.execute(dto)).rejects.toThrow("Database error");
    });

    it("should throw NotFoundException when there is no active plan", async () => {
      const dto = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      usersRepository.findByEmail.mockResolvedValue(null);
      personalsRepository.findBySlug.mockResolvedValue(null);
      plansRepository.findAllActive.mockResolvedValue([]);

      await expect(service.execute(dto)).rejects.toThrow(NotFoundException);
      expect(drizzleProvider.db.transaction).not.toHaveBeenCalled();
    });
  });
});
