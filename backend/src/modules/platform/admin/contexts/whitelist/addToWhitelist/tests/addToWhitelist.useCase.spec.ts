import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { AddToWhitelistUseCase } from "../addToWhitelist.useCase";

const makePersonalsRepository = (personal = { id: "personal-1" }) => ({
  findById: vi.fn().mockResolvedValue(personal),
  setWhitelisted: vi.fn().mockResolvedValue(undefined),
});

describe("AddToWhitelistUseCase", () => {
  let useCase: AddToWhitelistUseCase;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    useCase = new AddToWhitelistUseCase(personalsRepository as any);
  });

  it("should whitelist a personal", async () => {
    await useCase.execute("personal-1");
    expect(personalsRepository.setWhitelisted).toHaveBeenCalledWith("personal-1", true);
  });

  it("should throw NotFoundException when personal not found", async () => {
    personalsRepository.findById.mockResolvedValue(undefined);
    await expect(useCase.execute("personal-999")).rejects.toThrow(NotFoundException);
  });
});
