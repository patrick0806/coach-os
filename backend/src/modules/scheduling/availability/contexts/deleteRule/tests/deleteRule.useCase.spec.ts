import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteAvailabilityRuleUseCase } from "../deleteRule.useCase";

const RULE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeRule = (overrides = {}) => ({
  id: RULE_ID,
  tenantId: TENANT_ID,
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "12:00",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeRule()),
  delete: vi.fn().mockResolvedValue(true),
});

describe("DeleteAvailabilityRuleUseCase", () => {
  let useCase: DeleteAvailabilityRuleUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new DeleteAvailabilityRuleUseCase(repository as any);
  });

  it("should delete an availability rule successfully", async () => {
    await useCase.execute(RULE_ID, TENANT_ID);

    expect(repository.delete).toHaveBeenCalledWith(RULE_ID, TENANT_ID);
  });

  it("should throw NotFoundException when rule not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(RULE_ID, TENANT_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw NotFoundException when rule belongs to different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(RULE_ID, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });
});
