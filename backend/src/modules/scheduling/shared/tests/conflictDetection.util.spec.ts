import { describe, it, expect } from "vitest";

import { detectConflicts, ConflictDetectionInput } from "../conflictDetection.util";

const TENANT_ID = "tenant-id";

const makeBaseInput = (overrides: Partial<ConflictDetectionInput> = {}): ConflictDetectionInput => ({
  date: new Date("2026-04-06T10:00:00Z"), // Monday (dayOfWeek = 1)
  startTime: "10:00",
  endTime: "11:00",
  availabilityRules: [],
  availabilityExceptions: [],
  existingAppointments: [],
  trainingSchedules: [],
  ...overrides,
});

describe("detectConflicts", () => {
  it("should return no conflicts when no rules, exceptions, or appointments exist", () => {
    const conflicts = detectConflicts(makeBaseInput());

    expect(conflicts).toEqual([]);
  });

  it("should detect conflict with existing appointment", () => {
    const conflicts = detectConflicts(
      makeBaseInput({
        existingAppointments: [
          {
            id: "apt-1",
            tenantId: TENANT_ID,
            studentId: "student-1",
            appointmentRequestId: null,
            startAt: new Date("2026-04-06T10:30:00Z"),
            endAt: new Date("2026-04-06T11:30:00Z"),
            appointmentType: "presential",
            status: "scheduled",
            meetingUrl: null,
            location: null,
            notes: null,
            cancelledAt: null,
            cancellationReason: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    );

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe("appointment");
  });

  it("should detect conflict with training schedule", () => {
    const conflicts = detectConflicts(
      makeBaseInput({
        trainingSchedules: [
          {
            id: "ts-1",
            tenantId: TENANT_ID,
            studentId: "student-1",
            studentProgramId: null,
            dayOfWeek: 1,
            startTime: "09:30",
            endTime: "10:30",
            location: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    );

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe("training_schedule");
  });

  it("should detect when outside availability", () => {
    const conflicts = detectConflicts(
      makeBaseInput({
        availabilityRules: [
          {
            id: "rule-1",
            tenantId: TENANT_ID,
            dayOfWeek: 1,
            startTime: "14:00",
            endTime: "18:00",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    );

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe("outside_availability");
  });

  it("should detect exception on date", () => {
    const conflicts = detectConflicts(
      makeBaseInput({
        availabilityExceptions: [
          {
            id: "exc-1",
            tenantId: TENANT_ID,
            exceptionDate: "2026-04-06",
            reason: "Holiday",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    );

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe("exception");
  });

  it("should detect multiple conflicts simultaneously", () => {
    const conflicts = detectConflicts(
      makeBaseInput({
        availabilityExceptions: [
          {
            id: "exc-1",
            tenantId: TENANT_ID,
            exceptionDate: "2026-04-06",
            reason: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        existingAppointments: [
          {
            id: "apt-1",
            tenantId: TENANT_ID,
            studentId: "student-1",
            appointmentRequestId: null,
            startAt: new Date("2026-04-06T10:00:00Z"),
            endAt: new Date("2026-04-06T11:00:00Z"),
            appointmentType: "presential",
            status: "scheduled",
            meetingUrl: null,
            location: null,
            notes: null,
            cancelledAt: null,
            cancellationReason: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    );

    expect(conflicts.length).toBeGreaterThanOrEqual(2);
  });

  it("should not conflict with adjacent time slots", () => {
    const conflicts = detectConflicts(
      makeBaseInput({
        existingAppointments: [
          {
            id: "apt-1",
            tenantId: TENANT_ID,
            studentId: "student-1",
            appointmentRequestId: null,
            startAt: new Date("2026-04-06T11:00:00Z"),
            endAt: new Date("2026-04-06T12:00:00Z"),
            appointmentType: "presential",
            status: "scheduled",
            meetingUrl: null,
            location: null,
            notes: null,
            cancelledAt: null,
            cancellationReason: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    );

    expect(conflicts).toEqual([]);
  });

  it("should detect partial overlap", () => {
    const conflicts = detectConflicts(
      makeBaseInput({
        startTime: "10:00",
        endTime: "11:00",
        trainingSchedules: [
          {
            id: "ts-1",
            tenantId: TENANT_ID,
            studentId: "student-1",
            studentProgramId: null,
            dayOfWeek: 1,
            startTime: "10:45",
            endTime: "11:45",
            location: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    );

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe("training_schedule");
  });
});
