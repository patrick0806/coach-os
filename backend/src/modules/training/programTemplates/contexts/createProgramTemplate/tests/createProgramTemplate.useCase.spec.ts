import { describe, it, expect, beforeEach, vi } from "vitest";

import { CreateProgramTemplateUseCase } from "../createProgramTemplate.useCase";

const makeProgramTemplatesRepository = () => ({
  create: vi.fn().mockResolvedValue({
    id: "template-id-1",
    tenantId: "tenant-id-1",
    name: "Programa de Força",
    description: null,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

describe("CreateProgramTemplateUseCase", () => {
  let useCase: CreateProgramTemplateUseCase;
  let programTemplatesRepository: ReturnType<typeof makeProgramTemplatesRepository>;

  const tenantId = "tenant-id-1";

  const validBody = {
    name: "Programa de Força",
  };

  beforeEach(() => {
    programTemplatesRepository = makeProgramTemplatesRepository();
    useCase = new CreateProgramTemplateUseCase(programTemplatesRepository as any);
  });

  it("should create program template successfully", async () => {
    const result = await useCase.execute(validBody, tenantId);

    expect(result.id).toBe("template-id-1");
    expect(result.name).toBe("Programa de Força");
    expect(result.status).toBe("active");
  });

  it("should pass tenantId to repository", async () => {
    await useCase.execute(validBody, tenantId);

    expect(programTemplatesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId }),
    );
  });

  it("should throw ValidationException when name is missing", async () => {
    await expect(useCase.execute({}, tenantId)).rejects.toThrow();
  });

  it("should throw ValidationException when name is too short", async () => {
    await expect(
      useCase.execute({ name: "AB" }, tenantId),
    ).rejects.toThrow();
  });

  it("should create template with optional description", async () => {
    const bodyWithDescription = {
      ...validBody,
      description: "Um programa intenso de força",
    };

    programTemplatesRepository.create.mockResolvedValue({
      id: "template-id-1",
      tenantId,
      name: "Programa de Força",
      description: "Um programa intenso de força",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(bodyWithDescription, tenantId);

    expect(programTemplatesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Um programa intenso de força" }),
    );
    expect(result.description).toBe("Um programa intenso de força");
  });
});
