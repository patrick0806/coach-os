import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CreateStudentService } from "../create-student.service";

vi.mock("@shared/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@shared/utils")>();
  return {
    ...actual,
    generateSetupToken: vi.fn(() => ({
      raw: "raw-token-abc",
      hash: "hash-abc123",
    })),
    expiresInHours: vi.fn(() => new Date("2099-01-01")),
  };
});

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockCreatedUser = {
  id: "student-user-id",
  name: "Alice Silva",
  email: "alice@example.com",
  password: null,
  role: ApplicationRoles.STUDENT,
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockCreatedStudent = {
  id: "student-id",
  userId: "student-user-id",
  personalId: "personal-id",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
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

const mockPersonalUser = {
  id: "user-id",
  name: "John Doe",
  email: "john@example.com",
  password: "hashed",
  role: ApplicationRoles.PERSONAL,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("CreateStudentService", () => {
  let service: CreateStudentService;
  let usersRepository: {
    findByEmail: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let studentsRepository: {
    create: ReturnType<typeof vi.fn>;
  };
  let personalsRepository: {
    findById: ReturnType<typeof vi.fn>;
  };
  let passwordSetupTokensRepository: {
    create: ReturnType<typeof vi.fn>;
  };
  let resendProvider: {
    sendStudentInvite: ReturnType<typeof vi.fn>;
  };
  let drizzle: {
    db: { transaction: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    usersRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };
    studentsRepository = { create: vi.fn() };
    personalsRepository = { findById: vi.fn() };
    passwordSetupTokensRepository = { create: vi.fn() };
    resendProvider = { sendStudentInvite: vi.fn() };
    drizzle = {
      db: {
        transaction: vi.fn((cb) => cb({})),
      },
    };

    service = new CreateStudentService(
      usersRepository as any,
      studentsRepository as any,
      personalsRepository as any,
      passwordSetupTokensRepository as any,
      resendProvider as any,
      drizzle as any,
    );
  });

  describe("execute", () => {
    it("should create a student and send invite email successfully", async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      personalsRepository.findById.mockResolvedValue(mockPersonal);
      usersRepository.findById.mockResolvedValue(mockPersonalUser);
      usersRepository.create.mockResolvedValue(mockCreatedUser);
      studentsRepository.create.mockResolvedValue(mockCreatedStudent);
      passwordSetupTokensRepository.create.mockResolvedValue({});
      resendProvider.sendStudentInvite.mockResolvedValue(undefined);

      const result = await service.execute(
        { name: "Alice Silva", email: "alice@example.com" },
        mockCurrentUser,
      );

      expect(result).toEqual({
        studentId: "student-id",
        userId: "student-user-id",
        name: "Alice Silva",
        email: "alice@example.com",
        personalId: "personal-id",
        createdAt: mockCreatedStudent.createdAt,
      });

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        "alice@example.com",
      );
      expect(resendProvider.sendStudentInvite).toHaveBeenCalledOnce();
    });

    it("should throw ConflictException when email already exists", async () => {
      usersRepository.findByEmail.mockResolvedValue(mockCreatedUser);

      await expect(
        service.execute(
          { name: "Alice Silva", email: "alice@example.com" },
          mockCurrentUser,
        ),
      ).rejects.toThrow(ConflictException);

      expect(drizzle.db.transaction).not.toHaveBeenCalled();
      expect(resendProvider.sendStudentInvite).not.toHaveBeenCalled();
    });
  });
});
