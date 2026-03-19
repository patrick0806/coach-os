import { describe, it, expect, beforeEach, vi } from "vitest";
import { ListWhitelistedUseCase } from "../listWhitelisted.useCase";

const makePersonal = (overrides = {}) => ({
  id: "personal-1",
  name: "João",
  email: "joao@test.com",
  slug: "joao",
  accessStatus: "active",
  isWhitelisted: true,
  ...overrides,
});

const makePersonalsRepository = () => ({
  findAllPaginated: vi.fn().mockResolvedValue({ rows: [makePersonal()], total: 1 }),
});

describe("ListWhitelistedUseCase", () => {
  let useCase: ListWhitelistedUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    useCase = new ListWhitelistedUseCase(personalsRepository as any);
  });

  it("should return only whitelisted coaches", async () => {
    const result = await useCase.execute();
    expect(result).toHaveLength(1);
    expect(result[0].isWhitelisted).toBe(true);
  });

  it("should filter out non-whitelisted coaches", async () => {
    personalsRepository.findAllPaginated.mockResolvedValue({
      rows: [makePersonal({ isWhitelisted: false })],
      total: 1,
    });
    const result = await useCase.execute();
    expect(result).toHaveLength(0);
  });
});
