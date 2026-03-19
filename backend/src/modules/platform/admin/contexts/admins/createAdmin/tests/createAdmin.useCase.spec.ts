import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException } from "@nestjs/common";
import { CreateAdminUseCase } from "../createAdmin.useCase";

vi.mock("argon2", () => ({
  hash: vi.fn().mockResolvedValue("hashed-password"),
}));

vi.mock("@config/env", () => ({
  env: { HASH_PEPPER: "test-pepper" },
}));

const makeUsersRepository = (existing: unknown = undefined) => ({
  findByEmail: vi.fn().mockResolvedValue(existing),
  create: vi.fn().mockResolvedValue({ id: "user-1", name: "Admin", email: "admin@test.com", role: "ADMIN" }),
});

const makeAdminsRepository = () => ({
  create: vi.fn().mockResolvedValue({ id: "admin-1", userId: "user-1", createdAt: new Date() }),
});

describe("CreateAdminUseCase", () => {
  let useCase: CreateAdminUseCase;
  let usersRepository: ReturnType<typeof makeUsersRepository>;
  let adminsRepository: ReturnType<typeof makeAdminsRepository>;

  beforeEach(() => {
    usersRepository = makeUsersRepository();
    adminsRepository = makeAdminsRepository();
    useCase = new CreateAdminUseCase(usersRepository as any, adminsRepository as any);
  });

  it("should create an admin", async () => {
    const result = await useCase.execute({ name: "Admin", email: "admin@test.com", password: "password123" });
    expect(result.email).toBe("admin@test.com");
    expect(usersRepository.create).toHaveBeenCalled();
    expect(adminsRepository.create).toHaveBeenCalled();
  });

  it("should throw ConflictException when email already exists", async () => {
    usersRepository = makeUsersRepository({ id: "existing-user" });
    useCase = new CreateAdminUseCase(usersRepository as any, adminsRepository as any);
    await expect(useCase.execute({ name: "Admin", email: "admin@test.com", password: "password123" })).rejects.toThrow(ConflictException);
  });

  it("should throw on invalid data", async () => {
    await expect(useCase.execute({ name: "A", email: "invalid" })).rejects.toThrow();
  });
});
