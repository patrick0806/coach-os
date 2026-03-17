import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateProgramTemplateUseCase } from "../updateProgramTemplate.useCase";

const makeTemplate = (tenantId = "tenant-id-1") => ({
  id: "template-id-1",
  tenantId,
  name: "Programa Original",
  description: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeProgramTemplatesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeTemplate()),
  update: vi.fn().mockResolvedValue({
    ...makeTemplate(),
    name: "Programa Atualizado",
  }),
});

describe("UpdateProgramTemplateUseCase", () => {
  let useCase: UpdateProgramTemplateUseCase;
  let programTemplatesRepository: ReturnType<typeof makeProgramTemplatesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    programTemplatesRepository = makeProgramTemplatesRepository();
    useCase = new UpdateProgramTemplateUseCase(programTemplatesRepository as any);
  });

  it("should update program template successfully", async () => {
    const result = await useCase.execute(
      "template-id-1",
      { name: "Programa Atualizado" },
      tenantId,
    );

    expect(result.name).toBe("Programa Atualizado");
  });

  it("should throw NotFoundException when template not found", async () => {
    programTemplatesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { name: "Novo Nome" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when template belongs to different tenant", async () => {
    programTemplatesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("template-id-1", { name: "Novo Nome" }, "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should support partial updates", async () => {
    await useCase.execute("template-id-1", { description: "Nova descrição" }, tenantId);

    expect(programTemplatesRepository.update).toHaveBeenCalledWith(
      "template-id-1",
      tenantId,
      expect.objectContaining({ description: "Nova descrição" }),
    );
  });

  it("should throw ValidationException when name is too short", async () => {
    await expect(
      useCase.execute("template-id-1", { name: "AB" }, tenantId),
    ).rejects.toThrow();
  });
});
