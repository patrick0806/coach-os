import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";

import { InviteStudentUseCase } from "../inviteStudent.useCase";

const makeStudentsRepository = () => ({
  countByTenantId: vi.fn().mockResolvedValue(0),
  findByUserIdAndTenantId: vi.fn().mockResolvedValue(undefined),
});

const makeUsersRepository = () => ({
  findByEmail: vi.fn().mockResolvedValue(undefined),
  findById: vi.fn().mockResolvedValue({ id: "coach-user-id", name: "João Coach" }),
});

const makePersonalsRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "tenant-id-1",
    userId: "coach-user-id",
    subscriptionPlanId: "plan-id-1",
    slug: "joao-coach",
    isWhitelisted: false,
  }),
});

const makePlansRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: "plan-id-1", maxStudents: 10 }),
});

const makeStudentInvitationTokensRepository = () => ({
  invalidateByEmailAndTenant: vi.fn().mockResolvedValue(undefined),
  create: vi.fn().mockResolvedValue({
    id: "token-id-1",
    tenantId: "tenant-id-1",
    email: "maria@email.com",
    tokenHash: "hash",
    expiresAt: new Date(),
    usedAt: null,
    createdAt: new Date(),
  }),
});

const makeResendProvider = () => ({
  sendStudentInvite: vi.fn().mockResolvedValue(undefined),
});

describe("InviteStudentUseCase", () => {
  let useCase: InviteStudentUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let studentInvitationTokensRepository: ReturnType<typeof makeStudentInvitationTokensRepository>;
  let resendProvider: ReturnType<typeof makeResendProvider>;

  const tenantId = "tenant-id-1";
  const validBody = { name: "Maria Silva", email: "maria@email.com" };

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    usersRepository = makeUsersRepository();
    personalsRepository = makePersonalsRepository();
    plansRepository = makePlansRepository();
    studentInvitationTokensRepository = makeStudentInvitationTokensRepository();
    resendProvider = makeResendProvider();

    useCase = new InviteStudentUseCase(
      studentsRepository as any,
      usersRepository as any,
      personalsRepository as any,
      plansRepository as any,
      studentInvitationTokensRepository as any,
      resendProvider as any,
    );
  });

  it("should send invitation successfully", async () => {
    const result = await useCase.execute(validBody, tenantId);

    expect(result).toEqual({ message: "Invitation sent successfully" });
    expect(resendProvider.sendStudentInvite).toHaveBeenCalledOnce();
  });

  it("should invalidate previous tokens before creating new one", async () => {
    await useCase.execute(validBody, tenantId);

    expect(studentInvitationTokensRepository.invalidateByEmailAndTenant).toHaveBeenCalledWith(
      "maria@email.com",
      tenantId,
    );
    expect(studentInvitationTokensRepository.create).toHaveBeenCalledOnce();
  });

  it("should create token with 48-hour expiry", async () => {
    await useCase.execute(validBody, tenantId);

    expect(studentInvitationTokensRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        email: "maria@email.com",
        expiresAt: expect.any(Date),
      }),
    );
    const callArgs = studentInvitationTokensRepository.create.mock.calls[0][0];
    const now = new Date();
    const expected47h = new Date(now.getTime() + 47 * 60 * 60 * 1000);
    expect(callArgs.expiresAt.getTime()).toBeGreaterThan(expected47h.getTime());
  });

  it("should throw ForbiddenException when student limit is reached", async () => {
    studentsRepository.countByTenantId.mockResolvedValue(10);

    await expect(useCase.execute(validBody, tenantId)).rejects.toThrow(ForbiddenException);
  });

  it("should throw ConflictException when student already in tenant", async () => {
    usersRepository.findByEmail.mockResolvedValue({ id: "user-id-1" });
    studentsRepository.findByUserIdAndTenantId.mockResolvedValue({ id: "student-id-1" });

    await expect(useCase.execute(validBody, tenantId)).rejects.toThrow(ConflictException);
  });

  it("should throw NotFoundException when personal not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(validBody, tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should skip student limit check for whitelisted personal", async () => {
    personalsRepository.findById.mockResolvedValue({
      id: "tenant-id-1",
      userId: "coach-user-id",
      subscriptionPlanId: "plan-id-1",
      slug: "joao-coach",
      isWhitelisted: true,
    });
    studentsRepository.countByTenantId.mockResolvedValue(10); // at the limit

    const result = await useCase.execute(validBody, tenantId);
    expect(result).toEqual({ message: "Invitation sent successfully" });
    expect(studentsRepository.countByTenantId).not.toHaveBeenCalled();
  });

  it("should throw ValidationException on invalid input", async () => {
    await expect(useCase.execute({ name: "A", email: "invalid" }, tenantId)).rejects.toThrow();
  });
});
