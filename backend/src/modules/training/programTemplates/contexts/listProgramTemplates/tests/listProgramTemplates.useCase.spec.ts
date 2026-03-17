import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListProgramTemplatesUseCase } from "../listProgramTemplates.useCase";

const makeTemplate = (id: string) => ({
  id,
  tenantId: "tenant-id-1",
  name: `Template ${id}`,
  description: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeProgramTemplatesRepository = () => ({
  findAllByTenantId: vi.fn().mockResolvedValue({
    rows: [makeTemplate("t1"), makeTemplate("t2")],
    total: 2,
  }),
});

describe("ListProgramTemplatesUseCase", () => {
  let useCase: ListProgramTemplatesUseCase;
  let programTemplatesRepository: ReturnType<typeof makeProgramTemplatesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    programTemplatesRepository = makeProgramTemplatesRepository();
    useCase = new ListProgramTemplatesUseCase(programTemplatesRepository as any);
  });

  it("should list program templates with pagination", async () => {
    const result = await useCase.execute({ page: 0, size: 10 }, tenantId);

    expect(result.content).toHaveLength(2);
    expect(result.page).toBe(0);
    expect(result.size).toBe(10);
    expect(result.totalElements).toBe(2);
  });

  it("should use default pagination values", async () => {
    await useCase.execute({}, tenantId);

    expect(programTemplatesRepository.findAllByTenantId).toHaveBeenCalledWith(
      tenantId,
      expect.objectContaining({ page: 0, size: 10 }),
    );
  });

  it("should pass search filter to repository", async () => {
    await useCase.execute({ search: "força" }, tenantId);

    expect(programTemplatesRepository.findAllByTenantId).toHaveBeenCalledWith(
      tenantId,
      expect.objectContaining({ search: "força" }),
    );
  });

  it("should calculate totalPages correctly", async () => {
    programTemplatesRepository.findAllByTenantId.mockResolvedValue({
      rows: Array(10).fill(makeTemplate("t1")),
      total: 25,
    });

    const result = await useCase.execute({ size: 10 }, tenantId);

    expect(result.totalPages).toBe(3);
  });

  it("should return empty list when no templates exist", async () => {
    programTemplatesRepository.findAllByTenantId.mockResolvedValue({
      rows: [],
      total: 0,
    });

    const result = await useCase.execute({}, tenantId);

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
