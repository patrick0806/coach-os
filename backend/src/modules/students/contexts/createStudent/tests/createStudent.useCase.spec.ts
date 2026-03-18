import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";

import { CreateStudentUseCase } from "../createStudent.useCase";

const makeStudentsRepository = () => ({
  create: vi.fn().mockResolvedValue({
    id: "student-id-1",
    userId: "user-id-1",
    tenantId: "tenant-id-1",
    status: "active",
    phoneNumber: null,
    goal: null,
    observations: null,
    physicalRestrictions: null,
    currentStreak: 0,
    lastWorkoutDate: null,
    totalWorkouts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  countByTenantId: vi.fn().mockResolvedValue(0),
  findByUserIdAndTenantId: vi.fn().mockResolvedValue(undefined),
});

const makeUsersRepository = () => ({
  create: vi.fn().mockResolvedValue({
    id: "user-id-1",
    name: "Maria Silva",
    email: "maria@email.com",
    password: "hashed",
    role: "STUDENT",
    isActive: true,
    refreshTokenHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  findByEmail: vi.fn().mockResolvedValue(undefined),
});

const makePersonalsRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "tenant-id-1",
    subscriptionPlanId: "plan-id-1",
  }),
});

const makePlansRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "plan-id-1",
    maxStudents: 10,
  }),
});

const makeCoachStudentRelationsRepository = () => ({
  create: vi.fn().mockResolvedValue({
    id: "relation-id-1",
    tenantId: "tenant-id-1",
    studentId: "student-id-1",
    status: "active",
    startDate: new Date(),
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

const makeCoachingContractsRepository = () => ({
  create: vi.fn().mockResolvedValue({ id: "contract-id-1" }),
});

const makeServicePlansRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "service-plan-id-1",
    tenantId: "tenant-id-1",
    name: "Plano Online",
    price: "49.90",
    attendanceType: "online",
    isActive: true,
  }),
});

describe("CreateStudentUseCase", () => {
  let useCase: CreateStudentUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let coachStudentRelationsRepository: ReturnType<typeof makeCoachStudentRelationsRepository>;
  let coachingContractsRepository: ReturnType<typeof makeCoachingContractsRepository>;
  let servicePlansRepository: ReturnType<typeof makeServicePlansRepository>;

  const validBody = {
    name: "Maria Silva",
    email: "maria@email.com",
    phoneNumber: "+55 11 99999-9999",
    goal: "Perder peso",
  };

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    usersRepository = makeUsersRepository();
    personalsRepository = makePersonalsRepository();
    plansRepository = makePlansRepository();
    coachStudentRelationsRepository = makeCoachStudentRelationsRepository();
    coachingContractsRepository = makeCoachingContractsRepository();
    servicePlansRepository = makeServicePlansRepository();

    useCase = new CreateStudentUseCase(
      studentsRepository as any,
      usersRepository as any,
      personalsRepository as any,
      plansRepository as any,
      coachStudentRelationsRepository as any,
      coachingContractsRepository as any,
      servicePlansRepository as any,
    );
  });

  it("should create student successfully", async () => {
    const result = await useCase.execute(validBody, tenantId);

    expect(result.id).toBe("student-id-1");
    expect(result.name).toBe("Maria Silva");
    expect(result.email).toBe("maria@email.com");
    expect(result.status).toBe("active");
  });

  it("should create user with STUDENT role", async () => {
    await useCase.execute(validBody, tenantId);

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: "STUDENT" }),
    );
  });

  it("should create coach-student relation on success", async () => {
    await useCase.execute(validBody, tenantId);

    expect(coachStudentRelationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        studentId: "student-id-1",
        status: "active",
      }),
    );
  });

  it("should throw ForbiddenException when student limit is reached", async () => {
    studentsRepository.countByTenantId.mockResolvedValue(10);

    await expect(useCase.execute(validBody, tenantId)).rejects.toThrow(ForbiddenException);
  });

  it("should throw ConflictException when email already exists", async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: "other-user-id",
      email: "maria@email.com",
    });

    await expect(useCase.execute(validBody, tenantId)).rejects.toThrow(ConflictException);
  });

  it("should throw NotFoundException when personal not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(validBody, tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when plan not found", async () => {
    plansRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(validBody, tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException on invalid input", async () => {
    await expect(useCase.execute({ name: "A", email: "not-an-email" }, tenantId)).rejects.toThrow();
  });

  it("should use tenantId from parameter for student isolation", async () => {
    await useCase.execute(validBody, tenantId);

    expect(studentsRepository.countByTenantId).toHaveBeenCalledWith(tenantId);
    expect(studentsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId }),
    );
  });

  it("should normalize phone number by stripping non-digit characters", async () => {
    await useCase.execute({ ...validBody, phoneNumber: "(11) 99999-9999" }, tenantId);

    expect(studentsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "11999999999" }),
    );
  });

  it("should create coaching contract when servicePlanId is provided", async () => {
    await useCase.execute({ ...validBody, servicePlanId: "service-plan-id-1" }, tenantId);

    expect(coachingContractsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        studentId: "student-id-1",
        servicePlanId: "service-plan-id-1",
        status: "active",
      }),
    );
  });

  it("should not create coaching contract when servicePlanId is not provided", async () => {
    await useCase.execute(validBody, tenantId);

    expect(coachingContractsRepository.create).not.toHaveBeenCalled();
  });

  it("should throw NotFoundException when servicePlanId references unknown plan", async () => {
    servicePlansRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ ...validBody, servicePlanId: "nonexistent-plan" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });
});
