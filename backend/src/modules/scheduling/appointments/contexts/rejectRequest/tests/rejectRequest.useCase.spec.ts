import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, BadRequestException } from "@nestjs/common";

import { RejectAppointmentRequestUseCase } from "../rejectRequest.useCase";

const REQUEST_ID = "req-id-1";
const TENANT_ID = "tenant-id-1";

const makeRequest = (overrides = {}) => ({
  id: REQUEST_ID,
  tenantId: TENANT_ID,
  studentId: "student-id",
  requestedDate: new Date(),
  requestedStartTime: "10:00",
  requestedEndTime: "11:00",
  status: "pending" as const,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeRequest()),
  update: vi.fn().mockResolvedValue(makeRequest({ status: "rejected" })),
});

describe("RejectAppointmentRequestUseCase", () => {
  let useCase: RejectAppointmentRequestUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new RejectAppointmentRequestUseCase(repository as any);
  });

  it("should reject a request successfully", async () => {
    const result = await useCase.execute(REQUEST_ID, TENANT_ID);

    expect(result.status).toBe("rejected");
    expect(repository.update).toHaveBeenCalledWith(
      REQUEST_ID,
      TENANT_ID,
      expect.objectContaining({ status: "rejected" }),
    );
  });

  it("should throw NotFoundException when request not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(REQUEST_ID, TENANT_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw NotFoundException for different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(REQUEST_ID, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when already rejected", async () => {
    repository.findById.mockResolvedValue(makeRequest({ status: "rejected" }));

    await expect(useCase.execute(REQUEST_ID, TENANT_ID)).rejects.toThrow(
      BadRequestException,
    );
  });
});
