import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { UpdateTenantStatusUseCase } from "../updateTenantStatus.useCase";

const makePersonalsRepository = (personal = { id: "personal-1" }) => ({
  findById: vi.fn().mockResolvedValue(personal),
  updateSubscription: vi.fn().mockResolvedValue(undefined),
});

describe("UpdateTenantStatusUseCase", () => {
  let useCase: UpdateTenantStatusUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    useCase = new UpdateTenantStatusUseCase(personalsRepository as any);
  });

  it("should update tenant access status", async () => {
    await useCase.execute("personal-1", { accessStatus: "suspended" });
    expect(personalsRepository.updateSubscription).toHaveBeenCalledWith("personal-1", { accessStatus: "suspended" });
  });

  it("should throw NotFoundException when personal not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);
    await expect(useCase.execute("personal-999", { accessStatus: "active" })).rejects.toThrow(NotFoundException);
  });

  it("should throw on invalid status", async () => {
    await expect(useCase.execute("personal-1", { accessStatus: "invalid" })).rejects.toThrow();
  });
});
