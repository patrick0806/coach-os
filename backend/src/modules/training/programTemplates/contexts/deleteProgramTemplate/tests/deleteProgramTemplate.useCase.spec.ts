import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteProgramTemplateUseCase } from "../deleteProgramTemplate.useCase";

const makeTemplate = () => ({
  id: "template-id-1",
  tenantId: "tenant-id-1",
  name: "Programa de Força",
  description: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeProgramTemplatesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeTemplate()),
  delete: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteProgramTemplateUseCase", () => {
  let useCase: DeleteProgramTemplateUseCase;
  let programTemplatesRepository: ReturnType<typeof makeProgramTemplatesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    programTemplatesRepository = makeProgramTemplatesRepository();
    useCase = new DeleteProgramTemplateUseCase(programTemplatesRepository as any);
  });

  it("should delete program template successfully", async () => {
    await expect(
      useCase.execute("template-id-1", tenantId),
    ).resolves.toBeUndefined();

    expect(programTemplatesRepository.delete).toHaveBeenCalledWith(
      "template-id-1",
      tenantId,
    );
  });

  it("should throw NotFoundException when template not found", async () => {
    programTemplatesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when template belongs to different tenant", async () => {
    programTemplatesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("template-id-1", "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });
});
