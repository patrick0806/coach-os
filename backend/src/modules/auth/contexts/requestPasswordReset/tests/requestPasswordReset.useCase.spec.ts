import { describe, it, expect, beforeEach, vi } from "vitest";

import { env } from "@config/env";
import { RequestPasswordResetUseCase } from "../requestPasswordReset.useCase";

const USER_ID = "user-id";

const makeUser = (overrides = {}) => ({
  id: USER_ID,
  name: "João Silva",
  email: "joao@email.com",
  isActive: true,
  role: "PERSONAL",
  ...overrides,
});

const makeUsersRepository = () => ({
  findByEmail: vi.fn().mockResolvedValue(makeUser()),
});

const makePasswordTokensRepository = () => ({
  invalidateResetTokensByUserId: vi.fn().mockResolvedValue(undefined),
  createResetToken: vi.fn().mockResolvedValue({ id: "token-id" }),
});

const makeResendProvider = () => ({
  sendPasswordReset: vi.fn().mockResolvedValue(undefined),
});

describe("RequestPasswordResetUseCase", () => {
  let useCase: RequestPasswordResetUseCase;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let passwordTokensRepository: ReturnType<typeof makePasswordTokensRepository>;
  let resendProvider: ReturnType<typeof makeResendProvider>;

  beforeEach(() => {
    usersRepository = makeUsersRepository();
    passwordTokensRepository = makePasswordTokensRepository();
    resendProvider = makeResendProvider();

    useCase = new RequestPasswordResetUseCase(
      usersRepository as any,
      passwordTokensRepository as any,
      resendProvider as any,
    );
  });

  it("should invalidate previous tokens, create a new token, and send email on happy path", async () => {
    await useCase.execute({ email: "joao@email.com" });

    expect(passwordTokensRepository.invalidateResetTokensByUserId).toHaveBeenCalledWith(USER_ID);
    expect(passwordTokensRepository.createResetToken).toHaveBeenCalledOnce();
    expect(resendProvider.sendPasswordReset).toHaveBeenCalledOnce();
  });

  it("should NOT throw when email is not registered (anti-enumeration)", async () => {
    usersRepository.findByEmail.mockResolvedValue(undefined);

    await expect(useCase.execute({ email: "unknown@email.com" })).resolves.not.toThrow();
  });

  it("should NOT call createResetToken when user does not exist (anti-enumeration)", async () => {
    usersRepository.findByEmail.mockResolvedValue(undefined);

    await useCase.execute({ email: "unknown@email.com" });

    expect(passwordTokensRepository.createResetToken).not.toHaveBeenCalled();
  });

  it("should NOT call sendPasswordReset when user does not exist (anti-enumeration)", async () => {
    usersRepository.findByEmail.mockResolvedValue(undefined);

    await useCase.execute({ email: "unknown@email.com" });

    expect(resendProvider.sendPasswordReset).not.toHaveBeenCalled();
  });

  it("should invalidate previous tokens before creating a new one", async () => {
    const callOrder: string[] = [];
    passwordTokensRepository.invalidateResetTokensByUserId.mockImplementation(async () => {
      callOrder.push("invalidate");
    });
    passwordTokensRepository.createResetToken.mockImplementation(async () => {
      callOrder.push("create");
      return { id: "token-id" };
    });

    await useCase.execute({ email: "joao@email.com" });

    expect(callOrder).toEqual(["invalidate", "create"]);
  });

  it("should store the token hash (not raw token) in the database", async () => {
    await useCase.execute({ email: "joao@email.com" });

    const [createArgs] = passwordTokensRepository.createResetToken.mock.calls[0];
    // Token hash must be a 64-char hex SHA-256
    expect(createArgs.tokenHash).toHaveLength(64);
    expect(createArgs.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should create token with approximately 2 hours expiry", async () => {
    const before = Date.now();
    await useCase.execute({ email: "joao@email.com" });
    const after = Date.now();

    const [createArgs] = passwordTokensRepository.createResetToken.mock.calls[0];
    const expiresAt: Date = createArgs.expiresAt;
    const expiresAtMs = expiresAt.getTime();

    const twoHoursMs = 2 * 60 * 60 * 1000;
    expect(expiresAtMs).toBeGreaterThanOrEqual(before + twoHoursMs - 1000);
    expect(expiresAtMs).toBeLessThanOrEqual(after + twoHoursMs + 1000);
  });

  it("should throw ValidationException for invalid email format", async () => {
    await expect(useCase.execute({ email: "not-an-email" })).rejects.toMatchObject({
      name: "ValidationException",
    });
  });

  it("should throw ValidationException when body is empty", async () => {
    await expect(useCase.execute({})).rejects.toMatchObject({
      name: "ValidationException",
    });
  });

  it("should build reset URL using APP_URL from env", async () => {
    await useCase.execute({ email: "joao@email.com" });

    const [sendArgs] = resendProvider.sendPasswordReset.mock.calls[0];
    expect(sendArgs.resetPasswordUrl).toMatch(new RegExp(`^${env.APP_URL}/redefinir-senha\\?token=`));
  });

  it("should include the raw token (not hash) in the reset URL", async () => {
    await useCase.execute({ email: "joao@email.com" });

    const [createArgs] = passwordTokensRepository.createResetToken.mock.calls[0];
    const [sendArgs] = resendProvider.sendPasswordReset.mock.calls[0];

    // URL contains raw token; raw token hash must match stored hash
    const urlToken = sendArgs.resetPasswordUrl.split("token=")[1];
    const { createHash } = await import("crypto");
    const urlTokenHash = createHash("sha256").update(urlToken).digest("hex");

    expect(urlTokenHash).toBe(createArgs.tokenHash);
  });

  it("should build branded student URL when slug is provided", async () => {
    await useCase.execute({ email: "joao@email.com", slug: "joao-silva" });

    const [sendArgs] = resendProvider.sendPasswordReset.mock.calls[0];
    expect(sendArgs.resetPasswordUrl).toMatch(
      new RegExp(`^${env.APP_URL}/coach/joao-silva/redefinir-senha\\?token=`),
    );
  });

  it("should build global reset URL when slug is not provided", async () => {
    await useCase.execute({ email: "joao@email.com" });

    const [sendArgs] = resendProvider.sendPasswordReset.mock.calls[0];
    expect(sendArgs.resetPasswordUrl).not.toContain("/coach/");
    expect(sendArgs.resetPasswordUrl).toMatch(new RegExp(`^${env.APP_URL}/redefinir-senha\\?token=`));
  });
});
