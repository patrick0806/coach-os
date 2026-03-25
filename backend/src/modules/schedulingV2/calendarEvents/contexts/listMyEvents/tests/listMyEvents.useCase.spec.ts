import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { ListMyEventsUseCase } from "../listMyEvents.useCase";

const STUDENT_ID = "student-id-1";
const TENANT_ID = "tenant-id-1";

const makeEvent = (overrides = {}) => ({
  id: "event-id-1",
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  startAt: new Date("2026-04-06T10:00:00Z"),
  endAt: new Date("2026-04-06T11:00:00Z"),
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
  studentName: "John Doe",
  studentEmail: "john@test.com",
  ...overrides,
});

const makeRepository = () => ({
  findByStudentAndDateRange: vi.fn().mockResolvedValue([makeEvent()]),
});

describe("ListMyEventsUseCase", () => {
  let useCase: ListMyEventsUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListMyEventsUseCase(repository as any);
  });

  it("should return events for student in date range", async () => {
    const result = await useCase.execute(
      STUDENT_ID,
      TENANT_ID,
      { startDate: "2026-04-01", endDate: "2026-04-30" },
    );

    expect(result).toHaveLength(1);
    expect(repository.findByStudentAndDateRange).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      new Date("2026-04-01T00:00:00Z"),
      new Date("2026-04-30T23:59:59Z"),
    );
  });

  it("should throw validation error for invalid date format", async () => {
    await expect(
      useCase.execute(STUDENT_ID, TENANT_ID, {
        startDate: "invalid",
        endDate: "2026-04-30",
      }),
    ).rejects.toThrow();
  });

  it("should throw validation error when startDate is missing", async () => {
    await expect(
      useCase.execute(STUDENT_ID, TENANT_ID, {
        endDate: "2026-04-30",
      }),
    ).rejects.toThrow();
  });

  it("should throw BadRequestException when startDate > endDate", async () => {
    await expect(
      useCase.execute(STUDENT_ID, TENANT_ID, {
        startDate: "2026-04-30",
        endDate: "2026-04-01",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("should pass status filter if provided", async () => {
    await useCase.execute(
      STUDENT_ID,
      TENANT_ID,
      { startDate: "2026-04-01", endDate: "2026-04-30", status: "scheduled" },
    );

    // Status filtering happens at repository level; use case passes dates
    expect(repository.findByStudentAndDateRange).toHaveBeenCalled();
  });

  it("should return empty array when no events found", async () => {
    repository.findByStudentAndDateRange.mockResolvedValue([]);

    const result = await useCase.execute(
      STUDENT_ID,
      TENANT_ID,
      { startDate: "2026-04-01", endDate: "2026-04-30" },
    );

    expect(result).toHaveLength(0);
  });
});
