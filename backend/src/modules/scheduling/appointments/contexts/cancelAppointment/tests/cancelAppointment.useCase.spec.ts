import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, BadRequestException } from "@nestjs/common";

import { CancelAppointmentUseCase } from "../cancelAppointment.useCase";

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
  update: vi.fn().mockResolvedValue(makeAppointment({ status: "cancelled" })),
});

describe("CancelAppointmentUseCase", () => {
  let useCase: CancelAppointmentUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new CancelAppointmentUseCase(repository as any);
  });

  it("should cancel an appointment successfully", async () => {
    const result = await useCase.execute(APT_ID, {}, TENANT_ID);

    expect(repository.update).toHaveBeenCalledWith(
      APT_ID,
      TENANT_ID,
      expect.objectContaining({ status: "cancelled" }),
    );
    expect(result.status).toBe("cancelled");
  });

  it("should cancel with a reason", async () => {
    await useCase.execute(
      APT_ID,
      { cancellationReason: "Student requested" },
      TENANT_ID,
    );

    expect(repository.update).toHaveBeenCalledWith(
      APT_ID,
      TENANT_ID,
      expect.objectContaining({ cancellationReason: "Student requested" }),
    );
  });

  it("should throw NotFoundException when appointment not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(APT_ID, {}, TENANT_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw NotFoundException for different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(APT_ID, {}, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when already cancelled", async () => {
    repository.findById.mockResolvedValue(makeAppointment({ status: "cancelled" }));

    await expect(useCase.execute(APT_ID, {}, TENANT_ID)).rejects.toThrow(
      BadRequestException,
    );
  });
});
