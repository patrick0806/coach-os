import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { CreateAppointmentRequestUseCase } from "../createRequest.useCase";

const REQUEST_ID = "req-id-1";
const STUDENT_ID = "student-id-1";
const TENANT_ID = "tenant-id-1";

const makeRequest = (overrides = {}) => ({
  id: REQUEST_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  requestedDate: new Date("2026-12-01"),
  requestedStartTime: "10:00",
  requestedEndTime: "11:00",
  status: "pending" as const,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  create: vi.fn().mockResolvedValue(makeRequest()),
});

describe("CreateAppointmentRequestUseCase", () => {
  let useCase: CreateAppointmentRequestUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new CreateAppointmentRequestUseCase(repository as any);
  });

  it("should create an appointment request successfully", async () => {
    const result = await useCase.execute(
      {
        requestedDate: new Date("2026-12-01"),
        requestedStartTime: "10:00",
        requestedEndTime: "11:00",
      },
      STUDENT_ID,
      TENANT_ID,
    );

    expect(result.id).toBe(REQUEST_ID);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        studentId: STUDENT_ID,
        status: "pending",
      }),
    );
  });

  it("should throw validation error for invalid time format", async () => {
    await expect(
      useCase.execute(
        {
          requestedDate: new Date("2026-12-01"),
          requestedStartTime: "invalid",
          requestedEndTime: "11:00",
        },
        STUDENT_ID,
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw BadRequestException when start >= end time", async () => {
    await expect(
      useCase.execute(
        {
          requestedDate: new Date("2026-12-01"),
          requestedStartTime: "12:00",
          requestedEndTime: "10:00",
        },
        STUDENT_ID,
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should enforce tenant isolation via repository", async () => {
    await useCase.execute(
      {
        requestedDate: new Date("2026-12-01"),
        requestedStartTime: "10:00",
        requestedEndTime: "11:00",
      },
      STUDENT_ID,
      TENANT_ID,
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT_ID }),
    );
  });

  it("should throw BadRequestException for past date", async () => {
    await expect(
      useCase.execute(
        {
          requestedDate: new Date("2020-01-01"),
          requestedStartTime: "10:00",
          requestedEndTime: "11:00",
        },
        STUDENT_ID,
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
