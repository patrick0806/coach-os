import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteCheckinUseCase } from "../deleteCheckin.useCase";

const CHECKIN_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeCheckinsRepository = () => ({
  delete: vi.fn().mockResolvedValue(true),
});

describe("DeleteCheckinUseCase", () => {
  let useCase: DeleteCheckinUseCase;
  let checkinsRepository: ReturnType<typeof makeCheckinsRepository>;

  beforeEach(() => {
    checkinsRepository = makeCheckinsRepository();
    useCase = new DeleteCheckinUseCase(checkinsRepository as any);
  });

  it("should delete checkin successfully", async () => {
    await expect(useCase.execute(CHECKIN_ID, TENANT_ID)).resolves.toBeUndefined();
    expect(checkinsRepository.delete).toHaveBeenCalledWith(CHECKIN_ID, TENANT_ID);
  });

  it("should throw NotFoundException when checkin not found", async () => {
    checkinsRepository.delete.mockResolvedValue(false);

    await expect(useCase.execute("nonexistent-id", TENANT_ID)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when tenant does not match", async () => {
    checkinsRepository.delete.mockResolvedValue(false);

    await expect(useCase.execute(CHECKIN_ID, "wrong-tenant")).rejects.toThrow(NotFoundException);
  });

  it("should call repository with correct params", async () => {
    await useCase.execute(CHECKIN_ID, TENANT_ID);

    expect(checkinsRepository.delete).toHaveBeenCalledWith(CHECKIN_ID, TENANT_ID);
  });
});
