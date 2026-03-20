import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";

import { ChangePasswordUseCase } from "../changePassword.useCase";

const USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const CURRENT_PASSWORD = "OldStr0ng!";
const NEW_PASSWORD = "N3wStr0ng!";

const makeUser = (overrides = {}) => ({
  id: USER_ID,
  name: "João Silva",
  email: "joao@email.com",
  password: "$argon2id$v=19$m=65536,t=3,p=4$hashed_password",
  role: "PERSONAL" as const,
  refreshTokenHash: "some-hash",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeUsersRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeUser()),
  updatePassword: vi.fn().mockResolvedValue(undefined),
  updateRefreshTokenHash: vi.fn().mockResolvedValue(undefined),
});

const makeDrizzle = () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => cb({})),
  },
});

vi.mock("argon2", () => ({
  verify: vi.fn().mockResolvedValue(true),
  hash: vi.fn().mockResolvedValue("$argon2id$v=19$new_hashed_password"),
}));

describe("ChangePasswordUseCase", () => {
  let useCase: ChangePasswordUseCase;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let drizzle: ReturnType<typeof makeDrizzle>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(argon2.verify).mockResolvedValue(true);
    vi.mocked(argon2.hash).mockResolvedValue("$argon2id$v=19$new_hashed_password" as never);
    usersRepository = makeUsersRepository();
    drizzle = makeDrizzle();

    useCase = new ChangePasswordUseCase(
      usersRepository as any,
      drizzle as any,
    );
  });

  it("should update password and invalidate sessions on happy path", async () => {
    await useCase.execute({ userId: USER_ID, currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD });

    expect(drizzle.db.transaction).toHaveBeenCalledOnce();
    expect(usersRepository.updatePassword).toHaveBeenCalledOnce();
    expect(usersRepository.updateRefreshTokenHash).toHaveBeenCalledWith(USER_ID, null, {});
  });

  it("should verify current password before updating", async () => {
    await useCase.execute({ userId: USER_ID, currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD });

    expect(argon2.verify).toHaveBeenCalledOnce();
  });

  it("should hash new password with argon2 and pepper", async () => {
    await useCase.execute({ userId: USER_ID, currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD });

    expect(argon2.hash).toHaveBeenCalledOnce();
    const [, hashedPassword] = usersRepository.updatePassword.mock.calls[0];
    expect(hashedPassword).toMatch(/^\$argon2id\$/);
  });

  it("should throw UnauthorizedException when user is not found", async () => {
    usersRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ userId: USER_ID, currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when current password is wrong", async () => {
    vi.mocked(argon2.verify).mockResolvedValue(false);

    await expect(
      useCase.execute({ userId: USER_ID, currentPassword: "WrongPass!", newPassword: NEW_PASSWORD }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should not update password when current password is wrong", async () => {
    vi.mocked(argon2.verify).mockResolvedValue(false);

    await expect(
      useCase.execute({ userId: USER_ID, currentPassword: "WrongPass!", newPassword: NEW_PASSWORD }),
    ).rejects.toThrow();

    expect(usersRepository.updatePassword).not.toHaveBeenCalled();
    expect(drizzle.db.transaction).not.toHaveBeenCalled();
  });

  it("should pass transaction context to all write operations", async () => {
    await useCase.execute({ userId: USER_ID, currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD });

    const [, , txPassword] = usersRepository.updatePassword.mock.calls[0];
    const [, , txRefresh] = usersRepository.updateRefreshTokenHash.mock.calls[0];

    expect(txPassword).toBe(txRefresh);
  });

  it("should not execute writes when transaction fails", async () => {
    drizzle.db.transaction.mockRejectedValue(new Error("DB error"));

    await expect(
      useCase.execute({ userId: USER_ID, currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD }),
    ).rejects.toThrow("DB error");
  });

  it("should throw ValidationException when userId is not a valid uuid", async () => {
    await expect(
      useCase.execute({ userId: "not-a-uuid", currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should throw ValidationException when newPassword is shorter than 8 characters", async () => {
    await expect(
      useCase.execute({ userId: USER_ID, currentPassword: CURRENT_PASSWORD, newPassword: "Short1!" }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should throw ValidationException when currentPassword is empty", async () => {
    await expect(
      useCase.execute({ userId: USER_ID, currentPassword: "", newPassword: NEW_PASSWORD }),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });
});
