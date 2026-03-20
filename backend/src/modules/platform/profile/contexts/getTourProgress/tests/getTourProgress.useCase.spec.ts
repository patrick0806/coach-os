import { describe, it, expect, beforeEach, vi } from "vitest";

import { GetTourProgressUseCase } from "../getTourProgress.useCase";

const makeRepository = () => ({
  getTourProgress: vi.fn().mockResolvedValue(["exercises", "students"]),
});

describe("GetTourProgressUseCase", () => {
  let useCase: GetTourProgressUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new GetTourProgressUseCase(repository as any);
  });

  it("should return the list of completed tour pages", async () => {
    const result = await useCase.execute(tenantId);

    expect(result).toEqual(["exercises", "students"]);
    expect(repository.getTourProgress).toHaveBeenCalledWith(tenantId);
  });

  it("should return an empty array when no pages are completed", async () => {
    repository.getTourProgress.mockResolvedValue([]);

    const result = await useCase.execute(tenantId);

    expect(result).toEqual([]);
  });
});
