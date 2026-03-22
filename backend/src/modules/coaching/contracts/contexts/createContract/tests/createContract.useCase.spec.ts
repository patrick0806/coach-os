import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { CreateContractUseCase } from "../createContract.useCase";

const makePlan = (overrides = {}) => ({
  id: "plan-id-1",
  tenantId: "tenant-id-1",
  name: "Consultoria Online",
  description: null,
  price: "299.90",
  sessionsPerWeek: 3,
  durationMinutes: 60,
  attendanceType: "online" as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

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
  create: vi.fn().mockResolvedValue(makeContract()),
  findActiveByStudentId: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(makeContract({ status: "cancelled" })),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: "student-id-1", tenantId: "tenant-id-1", status: "active" }),
});

const makeServicePlansRepository = () => ({
  findById: vi.fn().mockResolvedValue(makePlan()),
});

const makeDrizzleProvider = () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<void>) => fn({})),
  },
});

describe("CreateContractUseCase", () => {
  let useCase: CreateContractUseCase;
  let contractsRepository: ReturnType<typeof makeContractsRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let servicePlansRepository: ReturnType<typeof makeServicePlansRepository>;

  const tenantId = "tenant-id-1";
  const studentId = "student-id-1";
  const validBody = { servicePlanId: "plan-id-1" };

  beforeEach(() => {
    contractsRepository = makeContractsRepository();
    studentsRepository = makeStudentsRepository();
    servicePlansRepository = makeServicePlansRepository();
    useCase = new CreateContractUseCase(
      contractsRepository as any,
      studentsRepository as any,
      servicePlansRepository as any,
      makeDrizzleProvider() as any,
    );
    // After creating, findActiveByStudentId returns the new contract
    contractsRepository.findActiveByStudentId.mockResolvedValue(makeContract());
  });

  it("should create a contract and return it with servicePlan", async () => {
    // First call (check existing active) → undefined, then second (fetch new) → contract
    contractsRepository.findActiveByStudentId
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(makeContract());

    const result = await useCase.execute(studentId, validBody, tenantId);

    expect(result.id).toBe("contract-id-1");
    expect(result.status).toBe("active");
    expect(result.servicePlan.name).toBe("Consultoria Online");
    expect(contractsRepository.create).toHaveBeenCalledWith({
      tenantId,
      studentId,
      servicePlanId: "plan-id-1",
      status: "active",
      startDate: expect.any(Date),
    }, expect.anything());
  });

  it("should auto-cancel existing active contract before creating new one", async () => {
    const existingContract = makeContract({ id: "old-contract-id" });
    contractsRepository.findActiveByStudentId
      .mockResolvedValueOnce(existingContract)
      .mockResolvedValueOnce(makeContract());

    await useCase.execute(studentId, validBody, tenantId);

    expect(contractsRepository.update).toHaveBeenCalledWith("old-contract-id", tenantId, {
      status: "cancelled",
      endDate: expect.any(Date),
    }, expect.anything());
    expect(contractsRepository.create).toHaveBeenCalled();
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(studentId, validBody, tenantId)).rejects.toThrow(NotFoundException);
    expect(contractsRepository.create).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException when student is archived", async () => {
    studentsRepository.findById.mockResolvedValue({ id: "student-id-1", tenantId: "tenant-id-1", status: "archived" });

    await expect(useCase.execute(studentId, validBody, tenantId)).rejects.toThrow(BadRequestException);
    expect(contractsRepository.create).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException when student is paused", async () => {
    studentsRepository.findById.mockResolvedValue({ id: "student-id-1", tenantId: "tenant-id-1", status: "paused" });

    await expect(useCase.execute(studentId, validBody, tenantId)).rejects.toThrow(BadRequestException);
    expect(contractsRepository.create).not.toHaveBeenCalled();
  });

  it("should throw NotFoundException when service plan not found", async () => {
    servicePlansRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(studentId, validBody, tenantId)).rejects.toThrow(NotFoundException);
    expect(contractsRepository.create).not.toHaveBeenCalled();
  });

  it("should throw NotFoundException when service plan is inactive", async () => {
    servicePlansRepository.findById.mockResolvedValue(makePlan({ isActive: false }));

    await expect(useCase.execute(studentId, validBody, tenantId)).rejects.toThrow(NotFoundException);
    expect(contractsRepository.create).not.toHaveBeenCalled();
  });
});
