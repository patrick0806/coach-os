import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { DeleteAdminUseCase } from "../deleteAdmin.useCase";

const makeAdminsRepository = (admin = { id: "admin-1", userId: "user-1" }) => ({
  findById: vi.fn().mockResolvedValue(admin),
  deleteById: vi.fn().mockResolvedValue(undefined),
});

const makeUsersRepository = () => ({
  deleteById: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteAdminUseCase", () => {
  let useCase: DeleteAdminUseCase;
  let adminsRepository: ReturnType<typeof makeAdminsRepository>;
  let usersRepository: ReturnType<typeof makeUsersRepository>;

  beforeEach(() => {
    adminsRepository = makeAdminsRepository();
    usersRepository = makeUsersRepository();
    useCase = new DeleteAdminUseCase(adminsRepository as any, usersRepository as any);
  });

  it("should delete admin and associated user", async () => {
    await useCase.execute("admin-1", "admin-2");
    expect(adminsRepository.deleteById).toHaveBeenCalledWith("admin-1");
    expect(usersRepository.deleteById).toHaveBeenCalledWith("user-1");
  });

  it("should throw BadRequestException when trying to delete self", async () => {
    await expect(useCase.execute("admin-1", "admin-1")).rejects.toThrow(BadRequestException);
  });

  it("should throw NotFoundException when admin not found", async () => {
    adminsRepository.findById.mockResolvedValue(undefined);
    await expect(useCase.execute("admin-999", "admin-2")).rejects.toThrow(NotFoundException);
  });
});
