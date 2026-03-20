import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import { createHash } from "crypto";

import { ResetPasswordUseCase } from "../resetPassword.useCase";

const RAW_TOKEN = "deadbeef0123456789abcdef0123456789abcdef0123456789abcdef01234567";
const TOKEN_HASH = createHash("sha256").update(RAW_TOKEN).digest("hex");
const USER_ID = "user-id";
const TOKEN_ID = "token-id";

const makeFutureDate = () => new Date(Date.now() + 2 * 60 * 60 * 1000);
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
  findById: vi.fn().mockResolvedValue({ id: USER_ID, name: "João Silva", email: "joao@email.com" }),
});

const makeResendProvider = () => ({
  sendPasswordResetConfirm: vi.fn().mockResolvedValue(undefined),
});

const makePasswordTokensRepository = () => ({
  findResetTokenByHash: vi.fn().mockResolvedValue(makeTokenRecord()),
  markResetTokenAsUsed: vi.fn().mockResolvedValue(undefined),
});

// Simulate db.transaction() by executing the callback immediately with a mock tx
const makeDrizzle = () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => cb({})),
  },
});

describe("ResetPasswordUseCase", () => {
  let useCase: ResetPasswordUseCase;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let passwordTokensRepository: ReturnType<typeof makePasswordTokensRepository>;
  let drizzle: ReturnType<typeof makeDrizzle>;
  let resendProvider: ReturnType<typeof makeResendProvider>;

  beforeEach(() => {
    usersRepository = makeUsersRepository();
    passwordTokensRepository = makePasswordTokensRepository();
    drizzle = makeDrizzle();
    resendProvider = makeResendProvider();

    useCase = new ResetPasswordUseCase(
      usersRepository as any,
      passwordTokensRepository as any,
      drizzle as any,
      resendProvider as any,
    );
  });

  it("should update password and mark token as used inside a transaction on happy path", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "N3wStr0ng!" });

    expect(drizzle.db.transaction).toHaveBeenCalledOnce();
    expect(usersRepository.updatePassword).toHaveBeenCalledOnce();
    expect(passwordTokensRepository.markResetTokenAsUsed).toHaveBeenCalledWith(TOKEN_ID, {});
  });

  it("should hash the token before looking it up in the database", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "N3wStr0ng!" });

    expect(passwordTokensRepository.findResetTokenByHash).toHaveBeenCalledWith(TOKEN_HASH);
  });

  it("should throw UnauthorizedException when token is not found", async () => {
    passwordTokensRepository.findResetTokenByHash.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "N3wStr0ng!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when token is expired", async () => {
    passwordTokensRepository.findResetTokenByHash.mockResolvedValue(
      makeTokenRecord({ expiresAt: makePastDate() }),
    );

    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "N3wStr0ng!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when token is already used", async () => {
    passwordTokensRepository.findResetTokenByHash.mockResolvedValue(
      makeTokenRecord({ usedAt: new Date() }),
    );

    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "N3wStr0ng!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should send password reset confirmation email after successful reset", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "N3wStr0ng!" });

    expect(resendProvider.sendPasswordResetConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ to: "joao@email.com" }),
    );
  });

  it("should hash password with argon2 and pepper", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "N3wStr0ng!" });

    const [, hashedPassword] = usersRepository.updatePassword.mock.calls[0];
    expect(hashedPassword).toMatch(/^\$argon2id\$/);
  });

  it("should invalidate the refresh token inside the same transaction", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "N3wStr0ng!" });

    expect(usersRepository.updateRefreshTokenHash).toHaveBeenCalledWith(USER_ID, null, {});
    expect(drizzle.db.transaction).toHaveBeenCalledOnce();
  });

  it("should NOT execute writes when transaction fails", async () => {
    drizzle.db.transaction.mockRejectedValue(new Error("DB error"));

    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "N3wStr0ng!" }),
    ).rejects.toThrow("DB error");
  });

  it("should throw ValidationException when token is empty", async () => {
    await expect(
      useCase.execute({ token: "", password: "N3wStr0ng!" }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should throw ValidationException when password is shorter than 8 characters", async () => {
    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "Short1!" }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should throw ValidationException when password is empty", async () => {
    await expect(
      useCase.execute({ token: RAW_TOKEN, password: "" }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should pass the transaction context (tx) to all write operations", async () => {
    await useCase.execute({ token: RAW_TOKEN, password: "N3wStr0ng!" });

    // All three write calls must receive the same tx object ({} in mock)
    const [, , txPassword] = usersRepository.updatePassword.mock.calls[0];
    const [, txToken] = passwordTokensRepository.markResetTokenAsUsed.mock.calls[0];
    const [, , txRefresh] = usersRepository.updateRefreshTokenHash.mock.calls[0];

    expect(txPassword).toBe(txToken);
    expect(txToken).toBe(txRefresh);
  });
});
