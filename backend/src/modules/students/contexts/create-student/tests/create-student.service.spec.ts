import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, ConflictException } from "@nestjs/common";

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
  servicePlanId: "service-plan-id",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockServicePlan = {
  id: "service-plan-id",
  personalId: "personal-id",
  name: "Plano 3x por semana",
  description: null,
  sessionsPerWeek: 3,
  durationMinutes: 60,
  price: "299.90",
  isActive: true,
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
    countActiveByPersonal: ReturnType<typeof vi.fn>;
  };
  let personalsRepository: {
    findById: ReturnType<typeof vi.fn>;
  };
  let passwordSetupTokensRepository: {
    create: ReturnType<typeof vi.fn>;
  };
  let servicePlansRepository: {
    findOwnedById: ReturnType<typeof vi.fn>;
  };
  let plansRepository: {
    findById: ReturnType<typeof vi.fn>;
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
    studentsRepository = {
      create: vi.fn(),
      countActiveByPersonal: vi.fn(),
    };
    personalsRepository = { findById: vi.fn() };
    passwordSetupTokensRepository = { create: vi.fn() };
    servicePlansRepository = { findOwnedById: vi.fn() };
    plansRepository = { findById: vi.fn() };
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
      servicePlansRepository as any,
      plansRepository as any,
      resendProvider as any,
      drizzle as any,
    );
  });

  describe("execute", () => {
    it("should create a student and send invite email successfully", async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      servicePlansRepository.findOwnedById.mockResolvedValue(mockServicePlan);
      personalsRepository.findById.mockResolvedValue(mockPersonal);
      plansRepository.findById.mockResolvedValue(null);
      studentsRepository.countActiveByPersonal.mockResolvedValue(4);
      usersRepository.findById.mockResolvedValue(mockPersonalUser);
      usersRepository.create.mockResolvedValue(mockCreatedUser);
      studentsRepository.create.mockResolvedValue(mockCreatedStudent);
      passwordSetupTokensRepository.create.mockResolvedValue({});
      resendProvider.sendStudentInvite.mockResolvedValue(undefined);

      const result = await service.execute(
        {
          name: "Alice Silva",
          email: "alice@example.com",
          servicePlanId: "service-plan-id",
        },
        mockCurrentUser,
      );

      expect(result).toEqual({
        studentId: "student-id",
        userId: "student-user-id",
        name: "Alice Silva",
        email: "alice@example.com",
        personalId: "personal-id",
        servicePlanId: "service-plan-id",
        servicePlanName: "Plano 3x por semana",
        createdAt: mockCreatedStudent.createdAt,
      });

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        "alice@example.com",
      );
      expect(servicePlansRepository.findOwnedById).toHaveBeenCalledWith(
        "service-plan-id",
        "personal-id",
      );
      expect(resendProvider.sendStudentInvite).toHaveBeenCalledOnce();
    });

    it("should throw ConflictException when email already exists", async () => {
      usersRepository.findByEmail.mockResolvedValue(mockCreatedUser);

      await expect(
        service.execute(
          {
            name: "Alice Silva",
            email: "alice@example.com",
            servicePlanId: "service-plan-id",
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(ConflictException);

      expect(drizzle.db.transaction).not.toHaveBeenCalled();
      expect(resendProvider.sendStudentInvite).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when service plan does not belong to personal", async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      servicePlansRepository.findOwnedById.mockResolvedValue(null);

      await expect(
        service.execute(
          {
            name: "Alice Silva",
            email: "alice@example.com",
            servicePlanId: "service-plan-id",
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(ConflictException);

      expect(drizzle.db.transaction).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when current plan student limit is reached", async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      servicePlansRepository.findOwnedById.mockResolvedValue(mockServicePlan);
      personalsRepository.findById.mockResolvedValue({
        ...mockPersonal,
        subscriptionPlanId: "plan-free-id",
      });
      plansRepository.findById.mockResolvedValue({
        id: "plan-free-id",
        name: "Free",
        maxStudents: 10,
      });
      studentsRepository.countActiveByPersonal.mockResolvedValue(10);

      await expect(
        service.execute(
          {
            name: "Alice Silva",
            email: "alice@example.com",
            servicePlanId: "service-plan-id",
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(drizzle.db.transaction).not.toHaveBeenCalled();
      expect(resendProvider.sendStudentInvite).not.toHaveBeenCalled();
    });

    it("should allow creation when plan has unlimited students", async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      servicePlansRepository.findOwnedById.mockResolvedValue(mockServicePlan);
      personalsRepository.findById.mockResolvedValue({
        ...mockPersonal,
        subscriptionPlanId: "plan-pro-id",
      });
      plansRepository.findById.mockResolvedValue({
        id: "plan-pro-id",
        name: "Pro",
        maxStudents: null,
      });
      usersRepository.findById.mockResolvedValue(mockPersonalUser);
      usersRepository.create.mockResolvedValue(mockCreatedUser);
      studentsRepository.create.mockResolvedValue(mockCreatedStudent);
      passwordSetupTokensRepository.create.mockResolvedValue({});
      resendProvider.sendStudentInvite.mockResolvedValue(undefined);

      const result = await service.execute(
        {
          name: "Alice Silva",
          email: "alice@example.com",
          servicePlanId: "service-plan-id",
        },
        mockCurrentUser,
      );

      expect(result.studentId).toBe("student-id");
      expect(studentsRepository.countActiveByPersonal).not.toHaveBeenCalled();
      expect(resendProvider.sendStudentInvite).toHaveBeenCalledOnce();
    });

    it("should propagate transaction failure and not send invite email", async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      servicePlansRepository.findOwnedById.mockResolvedValue(mockServicePlan);
      personalsRepository.findById.mockResolvedValue(mockPersonal);
      plansRepository.findById.mockResolvedValue(null);
      studentsRepository.countActiveByPersonal.mockResolvedValue(2);
      drizzle.db.transaction.mockRejectedValue(new Error("transaction failed"));

      await expect(
        service.execute(
          {
            name: "Alice Silva",
            email: "alice@example.com",
            servicePlanId: "service-plan-id",
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow("transaction failed");

      expect(usersRepository.findById).not.toHaveBeenCalled();
      expect(resendProvider.sendStudentInvite).not.toHaveBeenCalled();
    });
  });
});
