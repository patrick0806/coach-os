import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteExceptionUseCase } from "../deleteException.useCase";

const TENANT_ID = "tenant-001";
const EXCEPTION_ID = "exc-001";

const makeExceptionsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: EXCEPTION_ID, tenantId: TENANT_ID }),
  delete: vi.fn().mockResolvedValue(true),
});

describe("DeleteExceptionUseCase", () => {
  let useCase: DeleteExceptionUseCase;
  let exceptionsRepository: ReturnType<typeof makeExceptionsRepository>;

  beforeEach(() => {
    exceptionsRepository = makeExceptionsRepository();
    useCase = new DeleteExceptionUseCase(exceptionsRepository as any);
  });

  it("should delete an exception successfully", async () => {
    await useCase.execute(EXCEPTION_ID, TENANT_ID);

    expect(exceptionsRepository.delete).toHaveBeenCalledWith(EXCEPTION_ID, TENANT_ID);
  });

  it("should throw NotFoundException when exception not found", async () => {
    exceptionsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent", TENANT_ID),
    ).rejects.toThrow(NotFoundException);
  });
});
