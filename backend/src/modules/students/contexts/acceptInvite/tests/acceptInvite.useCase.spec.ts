import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";

import { AcceptInviteUseCase } from "../acceptInvite.useCase";

const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

const makeToken = (overrides = {}) => ({
  id: "token-id-1",
  tenantId: "tenant-id-1",
  email: "maria@email.com",
  tokenHash: "hashed-token",
  expiresAt: futureDate,
  usedAt: null,
  createdAt: new Date(),
  ...overrides,
});

const makeStudentInvitationTokensRepository = () => ({
  findByTokenHash: vi.fn().mockResolvedValue(makeToken()),
  markAsUsed: vi.fn().mockResolvedValue(undefined),
});

const makeUsersRepository = () => ({
  create: vi.fn().mockResolvedValue({
    id: "user-id-1",
    name: "Maria Silva",
    email: "maria@email.com",
    password: "hashed",
    role: "STUDENT",
  }),
  findByEmail: vi.fn().mockResolvedValue(undefined),
});

const makeStudentsRepository = () => ({
  create: vi.fn().mockResolvedValue({
    id: "student-id-1",
    userId: "user-id-1",
    tenantId: "tenant-id-1",
    status: "active",
  }),
  countByTenantId: vi.fn().mockResolvedValue(0),
  findByUserIdAndTenantId: vi.fn().mockResolvedValue(undefined),
});

const makePersonalsRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "tenant-id-1",
    subscriptionPlanId: "plan-id-1",
    isWhitelisted: false,
  }),
});

const makePlansRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: "plan-id-1", maxStudents: 10 }),
});

const makeCoachStudentRelationsRepository = () => ({
  create: vi.fn().mockResolvedValue({ id: "relation-id-1" }),
});

const makeDrizzleProvider = () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<void>) => fn({})),
  },
});

describe("AcceptInviteUseCase", () => {
  let useCase: AcceptInviteUseCase;
  let studentInvitationTokensRepository: ReturnType<typeof makeStudentInvitationTokensRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let coachStudentRelationsRepository: ReturnType<typeof makeCoachStudentRelationsRepository>;

  const validBody = {
    token: "a".repeat(64), // 32 bytes hex = 64 chars
    name: "Maria Silva",
    password: "Str0ngP@ss!",
  };

  beforeEach(() => {
    studentInvitationTokensRepository = makeStudentInvitationTokensRepository();
    usersRepository = makeUsersRepository();
    studentsRepository = makeStudentsRepository();
    personalsRepository = makePersonalsRepository();
    plansRepository = makePlansRepository();
    coachStudentRelationsRepository = makeCoachStudentRelationsRepository();

    useCase = new AcceptInviteUseCase(
      studentInvitationTokensRepository as any,
      usersRepository as any,
      studentsRepository as any,
      personalsRepository as any,
      plansRepository as any,
      coachStudentRelationsRepository as any,
      makeDrizzleProvider() as any,
    );
  });

  it("should create account successfully", async () => {
    const result = await useCase.execute(validBody);

    expect(result).toEqual({ message: "Account created successfully" });
  });

  it("should create user with STUDENT role", async () => {
    await useCase.execute(validBody);

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "STUDENT",
        email: "maria@email.com",
      }),
      expect.anything(),
    );
  });

  it("should create student with active status", async () => {
    await useCase.execute(validBody);

    expect(studentsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active" }),
      expect.anything(),
    );
  });

  it("should create coach-student relation", async () => {
    await useCase.execute(validBody);

    expect(coachStudentRelationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active" }),
      expect.anything(),
    );
  });

  it("should mark invitation token as used", async () => {
    await useCase.execute(validBody);

    expect(studentInvitationTokensRepository.markAsUsed).toHaveBeenCalledWith("token-id-1", expect.anything());
  });

  it("should not store plaintext password", async () => {
    await useCase.execute(validBody);

    const createCall = usersRepository.create.mock.calls[0][0];
    expect(createCall.password).not.toBe(validBody.password);
    expect(createCall.password).toBeDefined();
  });

  it("should throw UnauthorizedException when token not found", async () => {
    studentInvitationTokensRepository.findByTokenHash.mockResolvedValue(undefined);

    await expect(useCase.execute(validBody)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when token already used", async () => {
    studentInvitationTokensRepository.findByTokenHash.mockResolvedValue(
      makeToken({ usedAt: new Date() }),
    );

    await expect(useCase.execute(validBody)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when token is expired", async () => {
    studentInvitationTokensRepository.findByTokenHash.mockResolvedValue(
      makeToken({ expiresAt: new Date(Date.now() - 1000) }),
    );

    await expect(useCase.execute(validBody)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw ForbiddenException when student limit is reached", async () => {
    studentsRepository.countByTenantId.mockResolvedValue(10);

    await expect(useCase.execute(validBody)).rejects.toThrow(ForbiddenException);
  });

  it("should throw NotFoundException when personal not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(validBody)).rejects.toThrow(NotFoundException);
  });

  it("should skip student limit check for whitelisted personal", async () => {
    personalsRepository.findById.mockResolvedValue({
      id: "tenant-id-1",
      subscriptionPlanId: "plan-id-1",
      isWhitelisted: true,
    });
    studentsRepository.countByTenantId.mockResolvedValue(10); // at the limit

    const result = await useCase.execute(validBody);
    expect(result).toEqual({ message: "Account created successfully" });
    expect(studentsRepository.countByTenantId).not.toHaveBeenCalled();
  });

  it("should throw ValidationException on invalid input", async () => {
    await expect(useCase.execute({ token: "", name: "A", password: "short" })).rejects.toThrow();
  });

  // CHK-010: Multi-tenant student support
  it("should reuse existing user when student is invited by second coach", async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: "existing-user-id",
      name: "Maria Silva",
      email: "maria@email.com",
      role: "STUDENT",
      isActive: true,
    });

    const result = await useCase.execute(validBody);

    expect(result).toEqual({ message: "Account created successfully" });
    expect(usersRepository.create).not.toHaveBeenCalled();
    expect(studentsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "existing-user-id", tenantId: "tenant-id-1" }),
      expect.anything(),
    );
  });

  it("should throw BadRequestException when existing user has non-STUDENT role", async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: "existing-user-id",
      email: "maria@email.com",
      role: "PERSONAL",
    });

    await expect(useCase.execute(validBody)).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when student already exists in this tenant", async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: "existing-user-id",
      email: "maria@email.com",
      role: "STUDENT",
    });
    studentsRepository.findByUserIdAndTenantId.mockResolvedValue({
      id: "student-id-1",
      userId: "existing-user-id",
      tenantId: "tenant-id-1",
    });

    await expect(useCase.execute(validBody)).rejects.toThrow(BadRequestException);
  });
});
