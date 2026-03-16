import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";

import { GenerateInviteLinkUseCase } from "../generateInviteLink.useCase";

const makeStudentsRepository = () => ({
  countByTenantId: vi.fn().mockResolvedValue(0),
  findByUserIdAndTenantId: vi.fn().mockResolvedValue(undefined),
});

const makeUsersRepository = () => ({
  findByEmail: vi.fn().mockResolvedValue(undefined),
});

const makePersonalsRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "tenant-id-1",
    userId: "coach-user-id",
    subscriptionPlanId: "plan-id-1",
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

describe("GenerateInviteLinkUseCase", () => {
  let useCase: GenerateInviteLinkUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let studentInvitationTokensRepository: ReturnType<typeof makeStudentInvitationTokensRepository>;

  const tenantId = "tenant-id-1";
  const validBody = { name: "Maria Silva", email: "maria@email.com" };

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    usersRepository = makeUsersRepository();
    personalsRepository = makePersonalsRepository();
    plansRepository = makePlansRepository();
    studentInvitationTokensRepository = makeStudentInvitationTokensRepository();

    useCase = new GenerateInviteLinkUseCase(
      studentsRepository as any,
      usersRepository as any,
      personalsRepository as any,
      plansRepository as any,
      studentInvitationTokensRepository as any,
    );
  });

  it("should return invite link", async () => {
    const result = await useCase.execute(validBody, tenantId);

    expect(result.inviteLink).toContain("/accept-invite?token=");
    expect(result.inviteLink).toMatch(/token=[a-f0-9]{64}/);
  });

  it("should create an invitation token", async () => {
    await useCase.execute(validBody, tenantId);

    expect(studentInvitationTokensRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        email: "maria@email.com",
        expiresAt: expect.any(Date),
      }),
    );
  });

  it("should invalidate previous tokens", async () => {
    await useCase.execute(validBody, tenantId);

    expect(studentInvitationTokensRepository.invalidateByEmailAndTenant).toHaveBeenCalledWith(
      "maria@email.com",
      tenantId,
    );
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
});
