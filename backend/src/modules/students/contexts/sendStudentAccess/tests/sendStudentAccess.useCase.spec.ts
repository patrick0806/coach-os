import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ValidationException } from "@shared/exceptions";

import { SendStudentAccessUseCase } from "../sendStudentAccess.useCase";

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "student-id-1",
    userId: "user-id-1",
    tenantId: "tenant-id-1",
    name: "Carlos Mendonça",
    email: "carlos@email.com",
  }),
});

const makeUsersRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "user-id-1",
    name: "Carlos Mendonça",
    email: "carlos@email.com",
  }),
});

const makePersonalsRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "tenant-id-1",
    userId: "coach-user-id",
    subscriptionPlanId: "plan-id-1",
    slug: "joao-coach",
  }),
});

const makePasswordTokensRepository = () => ({
  invalidateSetupTokensByUserId: vi.fn().mockResolvedValue(undefined),
  createSetupToken: vi.fn().mockResolvedValue({
    id: "token-id-1",
    userId: "user-id-1",
    tokenHash: "hash",
    expiresAt: new Date(),
    usedAt: null,
    createdAt: new Date(),
  }),
});

const makeResendProvider = () => ({
  sendStudentInvite: vi.fn().mockResolvedValue(undefined),
});

const makeCoachUsersRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: "coach-user-id", name: "João Coach" }),
});

describe("SendStudentAccessUseCase", () => {
  let useCase: SendStudentAccessUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let passwordTokensRepository: ReturnType<typeof makePasswordTokensRepository>;
  let resendProvider: ReturnType<typeof makeResendProvider>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    usersRepository = makeUsersRepository();
    personalsRepository = makePersonalsRepository();
    passwordTokensRepository = makePasswordTokensRepository();
    resendProvider = makeResendProvider();

    useCase = new SendStudentAccessUseCase(
      studentsRepository as any,
      usersRepository as any,
      personalsRepository as any,
      passwordTokensRepository as any,
      resendProvider as any,
    );
  });

  it("should send access email and return message", async () => {
    const result = await useCase.execute("student-id-1", tenantId, "email");

    expect(result).toEqual({ message: "Link de acesso enviado com sucesso" });
    expect(resendProvider.sendStudentInvite).toHaveBeenCalledOnce();
    expect(passwordTokensRepository.createSetupToken).toHaveBeenCalledOnce();
  });

  it("should return access link without sending email", async () => {
    const result = await useCase.execute("student-id-1", tenantId, "link");

    expect(result).toHaveProperty("accessLink");
    expect((result as { accessLink: string }).accessLink).toContain("/configurar-senha?token=");
    expect((result as { accessLink: string }).accessLink).toContain("joao-coach");
    expect(resendProvider.sendStudentInvite).not.toHaveBeenCalled();
  });

  it("should invalidate old setup tokens before creating new one", async () => {
    await useCase.execute("student-id-1", tenantId, "email");

    expect(passwordTokensRepository.invalidateSetupTokensByUserId).toHaveBeenCalledWith("user-id-1");
    expect(passwordTokensRepository.createSetupToken).toHaveBeenCalledOnce();
  });

  it("should throw NotFoundException when student does not belong to tenant", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("student-id-1", tenantId, "email")).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when personal not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("student-id-1", tenantId, "email")).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when mode is invalid", async () => {
    await expect(useCase.execute("student-id-1", tenantId, "invalid")).rejects.toThrow(ValidationException);
  });
});
