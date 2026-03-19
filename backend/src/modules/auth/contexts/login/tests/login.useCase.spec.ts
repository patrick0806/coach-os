import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";

import { env } from "@config/env";
import { ApplicationRoles } from "@shared/enums";
import { LoginUseCase } from "../login.useCase";

// Hash created with the same pepper the implementation uses
let VALID_HASH: string;
beforeAll(async () => {
  VALID_HASH = await argon2.hash("Str0ngPass!" + env.HASH_PEPPER);
});

// VALID_HASH is set in beforeAll — the function captures it at call time
const makeUser = (overrides = {}) => ({
  id: "user-id",
  name: "João Silva",
  email: "joao@email.com",
  password: VALID_HASH,
  isActive: true,
  role: "PERSONAL",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePersonal = (overrides = {}) => ({
  id: "personal-id",
  userId: "user-id",
  slug: "joao-silva",
  accessStatus: "trialing",
  ...overrides,
});

const makeStudent = (overrides = {}) => ({
  id: "student-id",
  userId: "student-user-id",
  tenantId: "personal-id",
  status: "active",
  ...overrides,
});

const makeJwtService = () => ({
  sign: vi.fn().mockReturnValue("access.token.here"),
});

const makeUsersRepository = () => ({
  findByEmail: vi.fn().mockResolvedValue(makeUser()),
  updateRefreshTokenHash: vi.fn().mockResolvedValue(undefined),
});

const makePersonalsRepository = () => ({
  findByUserId: vi.fn().mockResolvedValue(makePersonal()),
  findById: vi.fn().mockResolvedValue(makePersonal()),
});

const makeStudentsRepository = () => ({
  findByUserId: vi.fn().mockResolvedValue(makeStudent()),
});

const makePlansRepository = () => ({
  findById: vi.fn().mockResolvedValue(undefined),
});

const makeAdminsRepository = () => ({
  findByUserId: vi.fn().mockResolvedValue({ id: "admin-id", userId: "admin-user-id" }),
});

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let adminsRepository: ReturnType<typeof makeAdminsRepository>;
  let jwtService: ReturnType<typeof makeJwtService>;

  beforeEach(() => {
    usersRepository = makeUsersRepository();
    personalsRepository = makePersonalsRepository();
    studentsRepository = makeStudentsRepository();
    plansRepository = makePlansRepository();
    adminsRepository = makeAdminsRepository();
    jwtService = makeJwtService();

    useCase = new LoginUseCase(
      usersRepository as any,
      personalsRepository as any,
      studentsRepository as any,
      plansRepository as any,
      adminsRepository as any,
      jwtService as any,
    );
  });

  it("should return access token and refresh token on valid credentials", async () => {
    const result = await useCase.execute({
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    expect(result.accessToken).toBe("access.token.here");
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe("joao@email.com");
    expect(result.personal!.id).toBe("personal-id");
  });

  it("should throw UnauthorizedException when email is not found", async () => {
    usersRepository.findByEmail.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ email: "notfound@email.com", password: "Str0ngPass!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when password is wrong", async () => {
    await expect(
      useCase.execute({ email: "joao@email.com", password: "WrongPassword!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should not reveal whether the email exists or password is wrong", async () => {
    usersRepository.findByEmail.mockResolvedValue(undefined);

    let emailNotFoundError: Error | undefined;
    try {
      await useCase.execute({ email: "notfound@email.com", password: "Str0ngPass!" });
    } catch (e) {
      emailNotFoundError = e as Error;
    }

    let wrongPasswordError: Error | undefined;
    usersRepository.findByEmail.mockResolvedValue(makeUser());
    try {
      await useCase.execute({ email: "joao@email.com", password: "WrongPassword!" });
    } catch (e) {
      wrongPasswordError = e as Error;
    }

    expect(emailNotFoundError?.message).toBe(wrongPasswordError?.message);
  });

  it("should throw UnauthorizedException when account is disabled", async () => {
    usersRepository.findByEmail.mockResolvedValue(makeUser({ isActive: false }));

    await expect(
      useCase.execute({ email: "joao@email.com", password: "Str0ngPass!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when personal profile is not found", async () => {
    personalsRepository.findByUserId.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ email: "joao@email.com", password: "Str0ngPass!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw ValidationException when email format is invalid", async () => {
    await expect(
      useCase.execute({ email: "not-an-email", password: "Str0ngPass!" }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should throw ValidationException when password is empty", async () => {
    await expect(
      useCase.execute({ email: "joao@email.com", password: "" }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should build correct JWT payload with PERSONAL role", async () => {
    await useCase.execute({ email: "joao@email.com", password: "Str0ngPass!" });

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "user-id",
        role: ApplicationRoles.PERSONAL,
        profileId: "personal-id",
        personalId: "personal-id",
        personalSlug: "joao-silva",
      }),
    );
  });

  it("should store new refresh token hash in users table replacing the old one", async () => {
    await useCase.execute({ email: "joao@email.com", password: "Str0ngPass!" });

    expect(usersRepository.updateRefreshTokenHash).toHaveBeenCalledOnce();
    const [userId, hash] = usersRepository.updateRefreshTokenHash.mock.calls[0];
    expect(userId).toBe("user-id");
    expect(hash).toHaveLength(64); // SHA-256 hex
  });

  it("should include tenantId in PERSONAL login result", async () => {
    const result = await useCase.execute({
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    expect(result.user.tenantId).toBe("personal-id");
  });

  // --- STUDENT branch ---

  it("should login a STUDENT successfully", async () => {
    usersRepository.findByEmail.mockResolvedValue(makeUser({ role: "STUDENT", id: "student-user-id" }));

    const result = await useCase.execute({
      email: "joao@email.com",
      password: "Str0ngPass!",
    });

    expect(result.accessToken).toBe("access.token.here");
    expect(result.refreshToken).toBeDefined();
    expect(result.user.role).toBe("STUDENT");
    expect(result.user.tenantId).toBe("personal-id");
    expect(result.user.personalSlug).toBe("joao-silva");
  });

  it("should throw ForbiddenException when STUDENT record not found", async () => {
    usersRepository.findByEmail.mockResolvedValue(makeUser({ role: "STUDENT", id: "student-user-id" }));
    studentsRepository.findByUserId.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ email: "joao@email.com", password: "Str0ngPass!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should include personalSlug in JWT payload for STUDENT", async () => {
    usersRepository.findByEmail.mockResolvedValue(makeUser({ role: "STUDENT", id: "student-user-id" }));

    await useCase.execute({ email: "joao@email.com", password: "Str0ngPass!" });

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "student-user-id",
        role: ApplicationRoles.STUDENT,
        profileId: "student-id",
        personalId: "personal-id",
        personalSlug: "joao-silva",
      }),
    );
  });

  // --- ADMIN branch ---

  it("should login an ADMIN successfully", async () => {
    usersRepository.findByEmail.mockResolvedValue(makeUser({ role: "ADMIN", id: "admin-user-id" }));

    const result = await useCase.execute({
      email: "admin@coachos.com",
      password: "Str0ngPass!",
    });

    expect(result.accessToken).toBe("access.token.here");
    expect(result.refreshToken).toBeDefined();
    expect(result.user.role).toBe("ADMIN");
    expect(result.user.tenantId).toBe("admin-id");
  });

  it("should throw UnauthorizedException when ADMIN record not found", async () => {
    usersRepository.findByEmail.mockResolvedValue(makeUser({ role: "ADMIN", id: "admin-user-id" }));
    adminsRepository.findByUserId.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ email: "admin@coachos.com", password: "Str0ngPass!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should build correct JWT payload with ADMIN role", async () => {
    usersRepository.findByEmail.mockResolvedValue(makeUser({ role: "ADMIN", id: "admin-user-id" }));

    await useCase.execute({ email: "admin@coachos.com", password: "Str0ngPass!" });

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "admin-user-id",
        role: ApplicationRoles.ADMIN,
        profileId: "admin-id",
        personalId: null,
        personalSlug: null,
      }),
    );
  });
});
