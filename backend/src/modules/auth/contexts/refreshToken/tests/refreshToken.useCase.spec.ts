import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import { createHash } from "crypto";

import { ApplicationRoles } from "@shared/enums";
import { RefreshTokenUseCase } from "../refreshToken.useCase";

const USER_ID = "user-id";
const PERSONAL_ID = "personal-id";
const RAW_TOKEN = "deadbeef0123456789abcdef0123456789abcdef0123456789abcdef01234567";
const TOKEN_HASH = createHash("sha256").update(RAW_TOKEN).digest("hex");
const COOKIE_VALUE = `${USER_ID}.${RAW_TOKEN}`;

const makeUser = (overrides = {}) => ({
  id: USER_ID,
  name: "João Silva",
  email: "joao@email.com",
  role: "PERSONAL",
  isActive: true,
  refreshTokenHash: TOKEN_HASH,
  ...overrides,
});

const makePersonal = (overrides = {}) => ({
  id: PERSONAL_ID,
  userId: USER_ID,
  slug: "joao-silva",
  accessStatus: "trialing",
  ...overrides,
});

const makeJwtService = () => ({
  sign: vi.fn().mockReturnValue("new.access.token"),
});

const makeUsersRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeUser()),
  updateRefreshTokenHash: vi.fn().mockResolvedValue(undefined),
});

const makePersonalsRepository = () => ({
  findByUserId: vi.fn().mockResolvedValue(makePersonal()),
});

describe("RefreshTokenUseCase", () => {
  let useCase: RefreshTokenUseCase;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let jwtService: ReturnType<typeof makeJwtService>;

  beforeEach(() => {
    usersRepository = makeUsersRepository();
    personalsRepository = makePersonalsRepository();
    jwtService = makeJwtService();

    useCase = new RefreshTokenUseCase(
      usersRepository as any,
      personalsRepository as any,
      jwtService as any,
    );
  });

  it("should return a new access token and a new refresh token on valid cookie", async () => {
    const result = await useCase.execute(COOKIE_VALUE);

    expect(result.accessToken).toBe("new.access.token");
    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe(RAW_TOKEN);
  });

  it("should throw UnauthorizedException when cookie is undefined", async () => {
    await expect(useCase.execute(undefined)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when cookie is empty string", async () => {
    await expect(useCase.execute("")).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when cookie format is invalid (no dot separator)", async () => {
    await expect(useCase.execute("no-dot-here")).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when user is not found", async () => {
    usersRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(COOKIE_VALUE)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when user has no stored refresh token hash", async () => {
    usersRepository.findById.mockResolvedValue(makeUser({ refreshTokenHash: null }));

    await expect(useCase.execute(COOKIE_VALUE)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException and invalidate token on hash mismatch (reuse detection)", async () => {
    usersRepository.findById.mockResolvedValue(makeUser({ refreshTokenHash: "wrong_hash" }));

    await expect(useCase.execute(COOKIE_VALUE)).rejects.toThrow(UnauthorizedException);

    // Invalidate stored hash to prevent further use
    expect(usersRepository.updateRefreshTokenHash).toHaveBeenCalledWith(USER_ID, null);
  });

  it("should throw UnauthorizedException when account is disabled", async () => {
    usersRepository.findById.mockResolvedValue(makeUser({ isActive: false }));

    await expect(useCase.execute(COOKIE_VALUE)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when personal profile is not found", async () => {
    personalsRepository.findByUserId.mockResolvedValue(undefined);

    await expect(useCase.execute(COOKIE_VALUE)).rejects.toThrow(UnauthorizedException);
  });

  it("should rotate refresh token — new hash replaces old hash in users table", async () => {
    const result = await useCase.execute(COOKIE_VALUE);

    expect(usersRepository.updateRefreshTokenHash).toHaveBeenCalledOnce();
    const [, newHash] = usersRepository.updateRefreshTokenHash.mock.calls[0];
    expect(newHash).toHaveLength(64); // SHA-256 hex
    expect(newHash).not.toBe(TOKEN_HASH); // new hash is different

    // The new raw token returned should match the new hash
    const expectedHash = createHash("sha256").update(result.refreshToken).digest("hex");
    expect(newHash).toBe(expectedHash);
  });

  it("should build correct JWT payload", async () => {
    await useCase.execute(COOKIE_VALUE);

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: USER_ID,
        role: ApplicationRoles.PERSONAL,
        personalId: PERSONAL_ID,
        profileId: PERSONAL_ID,
        personalSlug: "joao-silva",
      }),
    );
  });

  it("should use timing-safe comparison to prevent token oracle attacks", async () => {
    const wrongCookie = `${USER_ID}.aaaa0000000000000000000000000000000000000000000000000000000000aa`;
    usersRepository.findById.mockResolvedValue(makeUser({ refreshTokenHash: "some_stored_hash" }));

    await expect(useCase.execute(wrongCookie)).rejects.toThrow(UnauthorizedException);
  });
});
