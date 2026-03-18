import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ListContractsUseCase } from "../listContracts.useCase";

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
  findByStudentId: vi.fn().mockResolvedValue([makeContract()]),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: "student-id-1", tenantId: "tenant-id-1" }),
});

describe("ListContractsUseCase", () => {
  let useCase: ListContractsUseCase;
  let contractsRepository: ReturnType<typeof makeContractsRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  const tenantId = "tenant-id-1";
  const studentId = "student-id-1";

  beforeEach(() => {
    contractsRepository = makeContractsRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new ListContractsUseCase(contractsRepository as any, studentsRepository as any);
  });

  it("should return contracts with servicePlan for a student", async () => {
    const result = await useCase.execute(studentId, tenantId);

    expect(result).toHaveLength(1);
    expect(result[0].servicePlan.name).toBe("Consultoria Online");
    expect(contractsRepository.findByStudentId).toHaveBeenCalledWith(studentId, tenantId);
  });

  it("should return empty list when student has no contracts", async () => {
    contractsRepository.findByStudentId.mockResolvedValue([]);

    const result = await useCase.execute(studentId, tenantId);

    expect(result).toHaveLength(0);
  });

  it("should throw NotFoundException when student not found (tenant isolation)", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(studentId, "other-tenant")).rejects.toThrow(NotFoundException);
    expect(contractsRepository.findByStudentId).not.toHaveBeenCalled();
  });
});
