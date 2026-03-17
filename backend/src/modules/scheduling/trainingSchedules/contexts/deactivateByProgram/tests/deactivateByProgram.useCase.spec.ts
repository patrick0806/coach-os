import { describe, it, expect, beforeEach, vi } from "vitest";

import { DeactivateByProgramUseCase } from "../deactivateByProgram.useCase";

const PROGRAM_ID = "d4e5f6a7-b890-1234-cdef-567890abcdef";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeRepository = () => ({
  deactivateByProgramId: vi.fn().mockResolvedValue(2),
});

describe("DeactivateByProgramUseCase", () => {
  let useCase: DeactivateByProgramUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new DeactivateByProgramUseCase(repository as any);
  });

  it("should deactivate training schedules linked to a program", async () => {
    const result = await useCase.execute(PROGRAM_ID, TENANT_ID);

    expect(result).toBe(2);
    expect(repository.deactivateByProgramId).toHaveBeenCalledWith(
      PROGRAM_ID,
      TENANT_ID,
    );
  });

  it("should return 0 when no schedules are linked", async () => {
    repository.deactivateByProgramId.mockResolvedValue(0);

    const result = await useCase.execute(PROGRAM_ID, TENANT_ID);

    expect(result).toBe(0);
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute(PROGRAM_ID, TENANT_ID);

    expect(repository.deactivateByProgramId).toHaveBeenCalledWith(
      PROGRAM_ID,
      TENANT_ID,
    );
  });

  it("should not deactivate already inactive schedules", async () => {
    repository.deactivateByProgramId.mockResolvedValue(0);

    const result = await useCase.execute(PROGRAM_ID, TENANT_ID);

    expect(result).toBe(0);
  });
});
