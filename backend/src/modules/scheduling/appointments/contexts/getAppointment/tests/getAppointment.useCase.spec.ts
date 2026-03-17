import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetAppointmentUseCase } from "../getAppointment.useCase";

const APT_ID = "apt-id-1";
const TENANT_ID = "tenant-id-1";

const makeAppointment = (overrides = {}) => ({
  id: APT_ID,
  tenantId: TENANT_ID,
  studentId: "student-id",
  startAt: new Date(),
  endAt: new Date(),
  appointmentType: "presential",
  status: "scheduled",
  meetingUrl: null,
  location: "Academia",
  notes: null,
  cancelledAt: null,
  cancellationReason: null,
  appointmentRequestId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeAppointment()),
});

describe("GetAppointmentUseCase", () => {
  let useCase: GetAppointmentUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new GetAppointmentUseCase(repository as any);
  });

  it("should return an appointment", async () => {
    const result = await useCase.execute(APT_ID, TENANT_ID);

    expect(result.id).toBe(APT_ID);
  });

  it("should throw NotFoundException when appointment not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(APT_ID, TENANT_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw NotFoundException for different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(APT_ID, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute(APT_ID, TENANT_ID);

    expect(repository.findById).toHaveBeenCalledWith(APT_ID, TENANT_ID);
  });
});
