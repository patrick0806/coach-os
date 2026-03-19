import { describe, it, expect, beforeEach, vi } from "vitest";
import { ListAdminsUseCase } from "../listAdmins.useCase";

const makeAdmin = () => ({ id: "admin-1", userId: "user-1", name: "Admin", email: "admin@test.com", createdAt: new Date() });

const makeAdminsRepository = () => ({
  findAll: vi.fn().mockResolvedValue([makeAdmin()]),
});

describe("ListAdminsUseCase", () => {
  let useCase: ListAdminsUseCase;
  let adminsRepository: ReturnType<typeof makeAdminsRepository>;

  beforeEach(() => {
    adminsRepository = makeAdminsRepository();
    useCase = new ListAdminsUseCase(adminsRepository as any);
  });

  it("should return list of admins", async () => {
    const result = await useCase.execute();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Admin");
  });
});
