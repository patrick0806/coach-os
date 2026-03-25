import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, BadRequestException } from "@nestjs/common";

import { CompleteEventUseCase } from "../completeEvent.useCase";

const EVENT_ID = "event-id-1";
const TENANT_ID = "tenant-id-1";

const makeEvent = (overrides = {}) => ({
  id: EVENT_ID,
  tenantId: TENANT_ID,
  studentId: "student-id-1",
  startAt: new Date(),
  endAt: new Date(),
  type: "one_off" as const,
  recurringSlotId: null,
  originalStartAt: null,
  status: "scheduled" as const,
  appointmentType: "presential" as const,
  meetingUrl: null,
  location: "Academia",
  notes: null,
  cancelledAt: null,
  cancellationReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeEvent()),
  update: vi.fn().mockResolvedValue(makeEvent({ status: "completed" })),
});

describe("CompleteEventUseCase", () => {
  let useCase: CompleteEventUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new CompleteEventUseCase(repository as any);
  });

  it("should complete an event successfully", async () => {
    const result = await useCase.execute(EVENT_ID, TENANT_ID);

    expect(repository.update).toHaveBeenCalledWith(
      EVENT_ID,
      TENANT_ID,
      expect.objectContaining({ status: "completed" }),
    );
    expect(result.status).toBe("completed");
  });

  it("should throw NotFoundException when event not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(EVENT_ID, TENANT_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when already completed", async () => {
    repository.findById.mockResolvedValue(makeEvent({ status: "completed" }));

    await expect(
      useCase.execute(EVENT_ID, TENANT_ID),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when event is cancelled", async () => {
    repository.findById.mockResolvedValue(makeEvent({ status: "cancelled" }));

    await expect(
      useCase.execute(EVENT_ID, TENANT_ID),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw NotFoundException for different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(EVENT_ID, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });
});
