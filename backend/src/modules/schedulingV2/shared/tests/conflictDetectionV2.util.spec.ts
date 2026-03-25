import { describe, it, expect } from "vitest";

import { detectConflictsV2, ConflictDetectionV2Input } from "../conflictDetectionV2.util";
import type { WorkingHours } from "@shared/repositories/workingHours.repository";
import type { UnifiedCalendarEntry } from "../calendarPipeline.util";

const TENANT_ID = "tenant-1";

const makeWH = (overrides: Partial<WorkingHours> = {}): WorkingHours => ({
  id: "wh-1",
  tenantId: TENANT_ID,
  dayOfWeek: 1, // Monday
  startTime: "08:00",
  endTime: "18:00",
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeEntry = (overrides: Partial<UnifiedCalendarEntry> = {}): UnifiedCalendarEntry => ({
  id: "entry-1",
  source: "calendar_event",
  startAt: new Date("2026-04-06T10:00:00Z"),
  endAt: new Date("2026-04-06T11:00:00Z"),
  type: "one_off",
  status: "scheduled",
  ...overrides,
});

const makeInput = (overrides: Partial<ConflictDetectionV2Input> = {}): ConflictDetectionV2Input => ({
  proposedStartAt: new Date("2026-04-06T10:00:00Z"), // Monday
  proposedEndAt: new Date("2026-04-06T11:00:00Z"),
  workingHours: [],
  calendarEntries: [],
  ...overrides,
});

describe("detectConflictsV2", () => {
  it("should return no conflicts when no working hours and no entries", () => {
    const result = detectConflictsV2(makeInput());
    expect(result).toEqual([]);
  });

  it("should detect outside working hours", () => {
    const result = detectConflictsV2(
      makeInput({
        workingHours: [makeWH({ startTime: "14:00", endTime: "18:00" })],
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("outside_working_hours");
  });

  it("should not conflict when within working hours", () => {
    const result = detectConflictsV2(
      makeInput({
        workingHours: [makeWH()],
      }),
    );

    expect(result).toEqual([]);
  });

  it("should detect overlap with existing entry", () => {
    const result = detectConflictsV2(
      makeInput({
        calendarEntries: [
          makeEntry({
            startAt: new Date("2026-04-06T10:30:00Z"),
            endAt: new Date("2026-04-06T11:30:00Z"),
          }),
        ],
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("overlap");
  });

  it("should not conflict with cancelled entries", () => {
    const result = detectConflictsV2(
      makeInput({
        calendarEntries: [
          makeEntry({ status: "cancelled" }),
        ],
      }),
    );

    expect(result).toEqual([]);
  });

  it("should not conflict with adjacent time slots", () => {
    const result = detectConflictsV2(
      makeInput({
        calendarEntries: [
          makeEntry({
            startAt: new Date("2026-04-06T11:00:00Z"),
            endAt: new Date("2026-04-06T12:00:00Z"),
          }),
        ],
      }),
    );

    expect(result).toEqual([]);
  });

  it("should exclude event by id", () => {
    const result = detectConflictsV2(
      makeInput({
        calendarEntries: [
          makeEntry({
            id: "self",
            startAt: new Date("2026-04-06T10:00:00Z"),
            endAt: new Date("2026-04-06T11:00:00Z"),
          }),
        ],
        excludeEventId: "self",
      }),
    );

    expect(result).toEqual([]);
  });

  it("should detect multiple conflicts simultaneously", () => {
    const result = detectConflictsV2(
      makeInput({
        workingHours: [makeWH({ startTime: "14:00", endTime: "18:00" })],
        calendarEntries: [
          makeEntry({
            startAt: new Date("2026-04-06T10:00:00Z"),
            endAt: new Date("2026-04-06T11:00:00Z"),
          }),
        ],
      }),
    );

    expect(result).toHaveLength(2);
    const types = result.map((c) => c.type);
    expect(types).toContain("outside_working_hours");
    expect(types).toContain("overlap");
  });

  it("should detect partial overlap", () => {
    const result = detectConflictsV2(
      makeInput({
        calendarEntries: [
          makeEntry({
            startAt: new Date("2026-04-06T10:45:00Z"),
            endAt: new Date("2026-04-06T11:45:00Z"),
          }),
        ],
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("overlap");
  });
});
