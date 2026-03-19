import { describe, it, expect, beforeEach, vi } from "vitest";
import { ListTenantsUseCase } from "../listTenants.useCase";

const makePersonal = () => ({
  id: "personal-1",
  name: "João",
  email: "joao@test.com",
  slug: "joao",
  accessStatus: "active",
  subscriptionPlanId: "plan-1",
  isWhitelisted: false,
  onboardingCompleted: true,
  createdAt: new Date(),
});

const makePersonalsRepository = () => ({
  findAllPaginated: vi.fn().mockResolvedValue({ rows: [makePersonal()], total: 1 }),
});

describe("ListTenantsUseCase", () => {
  let useCase: ListTenantsUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    useCase = new ListTenantsUseCase(personalsRepository as any);
  });

  it("should return paginated tenants", async () => {
    const result = await useCase.execute({ page: 0, size: 20 });
    expect(result.content).toHaveLength(1);
    expect(result.totalElements).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("should pass search to repository", async () => {
    await useCase.execute({ search: "joao" });
    expect(personalsRepository.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ search: "joao" }),
    );
  });
});
