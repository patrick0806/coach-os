import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { CancelContractUseCase } from "../cancelContract.useCase";

const makeContract = (overrides = {}) => ({
  id: "contract-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  servicePlanId: "plan-id-1",
  status: "active" as const,
  startDate: new Date(),
  endDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  servicePlan: {
    id: "plan-id-1",
    name: "Consultoria Online",
    price: "299.90",
    attendanceType: "online" as const,
    sessionsPerWeek: 3,
    durationMinutes: 60,
  },
  ...overrides,
});

const makeContractsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeContract()),
  update: vi.fn().mockResolvedValue(makeContract({ status: "cancelled", endDate: new Date() })),
});

describe("CancelContractUseCase", () => {
  let useCase: CancelContractUseCase;
  let contractsRepository: ReturnType<typeof makeContractsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    contractsRepository = makeContractsRepository();
    useCase = new CancelContractUseCase(contractsRepository as any);
  });

  it("should cancel an active contract", async () => {
    const cancelledContract = makeContract({ status: "cancelled", endDate: new Date() });
    contractsRepository.findById
      .mockResolvedValueOnce(makeContract())
      .mockResolvedValueOnce(cancelledContract);

    const result = await useCase.execute("contract-id-1", tenantId);

    expect(result.status).toBe("cancelled");
    expect(contractsRepository.update).toHaveBeenCalledWith("contract-id-1", tenantId, {
      status: "cancelled",
      endDate: expect.any(Date),
    });
  });

  it("should throw NotFoundException when contract not found or wrong tenant", async () => {
    contractsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow(NotFoundException);
    expect(contractsRepository.update).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException when contract is already cancelled", async () => {
    contractsRepository.findById.mockResolvedValue(makeContract({ status: "cancelled" }));

    await expect(useCase.execute("contract-id-1", tenantId)).rejects.toThrow(BadRequestException);
    expect(contractsRepository.update).not.toHaveBeenCalled();
  });

  it("should return the updated contract after cancellation", async () => {
    const cancelledContract = makeContract({ status: "cancelled", endDate: new Date() });
    contractsRepository.findById
      .mockResolvedValueOnce(makeContract())
      .mockResolvedValueOnce(cancelledContract);

    const result = await useCase.execute("contract-id-1", tenantId);

    expect(result.id).toBe("contract-id-1");
    expect(result.status).toBe("cancelled");
    expect(result.endDate).toBeDefined();
  });
});
