import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { MarkPageTouredUseCase } from "../markPageToured.useCase";

const makeRepository = () => ({
  markPageToured: vi.fn().mockResolvedValue(["exercises"]),
});

describe("MarkPageTouredUseCase", () => {
  let useCase: MarkPageTouredUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new MarkPageTouredUseCase(repository as any);
  });

  it("should mark a valid page as toured and return updated list", async () => {
    const result = await useCase.execute(tenantId, "exercises");

    expect(result).toEqual(["exercises"]);
    expect(repository.markPageToured).toHaveBeenCalledWith(tenantId, "exercises");
  });

  it("should accept all valid pages", async () => {
    const validPages = [
      "exercises",
      "students",
      "training",
      "schedule",
      "availability",
      "services",
      "landingPage",
      "profile",
    ];

    for (const page of validPages) {
      repository.markPageToured.mockResolvedValue([page]);
      const result = await useCase.execute(tenantId, page);
      expect(result).toEqual([page]);
    }
  });

  it("should throw BadRequestException for an invalid page", async () => {
    await expect(useCase.execute(tenantId, "invalid-page")).rejects.toThrow(BadRequestException);
    expect(repository.markPageToured).not.toHaveBeenCalled();
  });

  it("should be idempotent — marking the same page twice does not throw", async () => {
    repository.markPageToured.mockResolvedValue(["exercises"]);

    await useCase.execute(tenantId, "exercises");
    await useCase.execute(tenantId, "exercises");

    expect(repository.markPageToured).toHaveBeenCalledTimes(2);
  });
});
