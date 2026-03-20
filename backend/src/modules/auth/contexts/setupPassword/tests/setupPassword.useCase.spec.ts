import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import { createHash } from "crypto";

import { SetupPasswordUseCase } from "../setupPassword.useCase";

const RAW_TOKEN = "aabbccdd0123456789abcdef0123456789abcdef0123456789abcdef01234567";
const TOKEN_HASH = createHash("sha256").update(RAW_TOKEN).digest("hex");
const USER_ID = "user-id";
const TOKEN_ID = "token-id";

const makeFutureDate = () => new Date(Date.now() + 48 * 60 * 60 * 1000);
const makePastDate = () => new Date(Date.now() - 1);

const makeTokenRecord = (overrides = {}) => ({
  id: TOKEN_ID,
  userId: USER_ID,
  tokenHash: TOKEN_HASH,
  expiresAt: makeFutureDate(),
  usedAt: null,
  createdAt: new Date(),
  ...overrides,
});

const makeUsersRepository = () => ({
  updatePassword: vi.fn().mockResolvedValue(undefined),
  updateRefreshTokenHash: vi.fn().mockResolvedValue(undefined),
  findById: vi.fn().mockResolvedValue({ id: USER_ID, name: "Ana Paula", email: "ana@email.com" }),
});

const makeResendProvider = () => ({
  sendStudentPasswordSetupConfirm: vi.fn().mockResolvedValue(undefined),
});

const makePasswordTokensRepository = () => ({
  findSetupTokenByHash: vi.fn().mockResolvedValue(makeTokenRecord()),
  markSetupTokenAsUsed: vi.fn().mockResolvedValue(undefined),
});

// Simulate db.transaction() by executing the callback immediately with a mock tx
const makeDrizzle = () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => cb({})),
  },
});

describe("SetupPasswordUseCase", () => {
  let useCase: SetupPasswordUseCase;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let passwordTokensRepository: ReturnType<typeof makePasswordTokensRepository>;
  let drizzle: ReturnType<typeof makeDrizzle>;
  let resendProvider: ReturnType<typeof makeResendProvider>;

  beforeEach(() => {
    usersRepository = makeUsersRepository();
    passwordTokensRepository = makePasswordTokensRepository();
    drizzle = makeDrizzle();
    resendProvider = makeResendProvider();

    useCase = new SetupPasswordUseCase(
      usersRepository as any,
      passwordTokensRepository as any,
      drizzle as any,
      resendProvider as any,
    );
  });

  it("should update password and mark token as used inside a transaction on happy path", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "Str0ngP@ss!" });

    expect(drizzle.db.transaction).toHaveBeenCalledOnce();
    expect(usersRepository.updatePassword).toHaveBeenCalledOnce();
    expect(passwordTokensRepository.markSetupTokenAsUsed).toHaveBeenCalledWith(TOKEN_ID, {});
  });

  it("should hash the token before looking it up in the database", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "Str0ngP@ss!" });

    expect(passwordTokensRepository.findSetupTokenByHash).toHaveBeenCalledWith(TOKEN_HASH);
  });

  it("should throw UnauthorizedException when token is not found", async () => {
    passwordTokensRepository.findSetupTokenByHash.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "Str0ngP@ss!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when token is expired", async () => {
    passwordTokensRepository.findSetupTokenByHash.mockResolvedValue(
      makeTokenRecord({ expiresAt: makePastDate() }),
    );

    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "Str0ngP@ss!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when token is already used", async () => {
    passwordTokensRepository.findSetupTokenByHash.mockResolvedValue(
      makeTokenRecord({ usedAt: new Date() }),
    );

    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "Str0ngP@ss!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should send password setup confirmation email after successful setup", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "Str0ngP@ss!" });

    expect(resendProvider.sendStudentPasswordSetupConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ to: "ana@email.com" }),
    );
  });

  it("should hash password with argon2 and pepper", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "Str0ngP@ss!" });

    const [, hashedPassword] = usersRepository.updatePassword.mock.calls[0];
    expect(hashedPassword).toMatch(/^\$argon2id\$/);
  });

  it("should NOT invalidate refresh tokens (invited user has no active sessions)", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "Str0ngP@ss!" });

    expect(usersRepository.updateRefreshTokenHash).not.toHaveBeenCalled();
  });

  it("should NOT execute writes when transaction fails", async () => {
    drizzle.db.transaction.mockRejectedValue(new Error("DB error"));

    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "Str0ngP@ss!" }),
    ).rejects.toThrow("DB error");
  });

  it("should throw ValidationException when token is empty", async () => {
    await expect(
      useCase.execute({ token: "", password: "Str0ngP@ss!" }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should throw ValidationException when password is shorter than 8 characters", async () => {
    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "Short1!" }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should pass the transaction context (tx) to all write operations", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "Str0ngP@ss!" });

    // Both write calls must receive the same tx object ({} in mock)
    const [, , txPassword] = usersRepository.updatePassword.mock.calls[0];
    const [, txToken] = passwordTokensRepository.markSetupTokenAsUsed.mock.calls[0];

    expect(txPassword).toBe(txToken);
  });
});
