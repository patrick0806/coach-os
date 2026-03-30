import { describe, it, expect } from "vitest";

import { computeAvailability, AvailabilityInput } from "../availabilityComputation.util";
import type { WorkingHours } from "@shared/repositories/workingHours.repository";
import type { UnifiedCalendarEntry } from "../calendarPipeline.util";

const TENANT_ID = "tenant-1";

const makeWH = (overrides: Partial<WorkingHours> = {}): WorkingHours => ({
  id: "wh-1",
  tenantId: TENANT_ID,
  dayOfWeek: 1, // Monday
  startTime: "08:00",
  endTime: "12:00",
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
  startAt: new Date("2026-04-06T09:00:00Z"),
  endAt: new Date("2026-04-06T10:00:00Z"),
  type: "one_off",
  status: "scheduled",
  ...overrides,
});

const makeInput = (overrides: Partial<AvailabilityInput> = {}): AvailabilityInput => ({
  workingHours: [],
  calendarEntries: [],
  startDate: new Date("2026-04-06T00:00:00Z"), // Monday
  endDate: new Date("2026-04-06T23:59:59Z"), // Same day
  ...overrides,
});

describe("computeAvailability", () => {
  it("should return empty when no working hours", () => {
    const result = computeAvailability(makeInput());
    expect(result).toEqual([]);
  });

  it("should return full working hours when no busy entries", () => {
    const result = computeAvailability(
      makeInput({
        workingHours: [makeWH()],
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].startAt).toEqual(new Date("2026-04-06T08:00:00Z"));
    expect(result[0].endAt).toEqual(new Date("2026-04-06T12:00:00Z"));
  });

  it("should subtract busy entry from working hours", () => {
    const result = computeAvailability(
      makeInput({
        workingHours: [makeWH()],
        calendarEntries: [
          makeEntry({
            startAt: new Date("2026-04-06T09:00:00Z"),
            endAt: new Date("2026-04-06T10:00:00Z"),
          }),
        ],
      }),
    );

    expect(result).toHaveLength(2);
    // 08:00-09:00 free
    expect(result[0].startAt).toEqual(new Date("2026-04-06T08:00:00Z"));
    expect(result[0].endAt).toEqual(new Date("2026-04-06T09:00:00Z"));
    // 10:00-12:00 free
    expect(result[1].startAt).toEqual(new Date("2026-04-06T10:00:00Z"));
    expect(result[1].endAt).toEqual(new Date("2026-04-06T12:00:00Z"));
  });

  it("should subtract multiple busy entries", () => {
    const result = computeAvailability(
      makeInput({
        workingHours: [makeWH()],
        calendarEntries: [
          makeEntry({
            id: "e1",
            startAt: new Date("2026-04-06T08:00:00Z"),
            endAt: new Date("2026-04-06T09:00:00Z"),
          }),
          makeEntry({
            id: "e2",
            startAt: new Date("2026-04-06T11:00:00Z"),
            endAt: new Date("2026-04-06T12:00:00Z"),
          }),
        ],
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].startAt).toEqual(new Date("2026-04-06T09:00:00Z"));
    expect(result[0].endAt).toEqual(new Date("2026-04-06T11:00:00Z"));
  });

  it("should not subtract cancelled entries", () => {
    const result = computeAvailability(
      makeInput({
        workingHours: [makeWH()],
        calendarEntries: [
          makeEntry({ status: "cancelled" }),
        ],
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].startAt).toEqual(new Date("2026-04-06T08:00:00Z"));
    expect(result[0].endAt).toEqual(new Date("2026-04-06T12:00:00Z"));
  });

  it("should handle working hours with effectiveTo in past", () => {
    const result = computeAvailability(
      makeInput({
        workingHours: [makeWH({ effectiveTo: "2026-03-01" })],
      }),
    );

    expect(result).toEqual([]);
  });

  it("should handle multiple working hours windows on same day", () => {
    const result = computeAvailability(
      makeInput({
        workingHours: [
          makeWH({ id: "wh-1", startTime: "08:00", endTime: "12:00" }),
          makeWH({ id: "wh-2", startTime: "14:00", endTime: "18:00" }),
        ],
      }),
    );

    expect(result).toHaveLength(2);
    expect(result[0].startAt).toEqual(new Date("2026-04-06T08:00:00Z"));
    expect(result[0].endAt).toEqual(new Date("2026-04-06T12:00:00Z"));
    expect(result[1].startAt).toEqual(new Date("2026-04-06T14:00:00Z"));
    expect(result[1].endAt).toEqual(new Date("2026-04-06T18:00:00Z"));
  });

  it("should handle effectiveFrom as Date object (defense-in-depth)", () => {
    const result = computeAvailability(
      makeInput({
        workingHours: [
          makeWH({ effectiveFrom: new Date("2026-01-01T00:00:00Z") as any }),
        ],
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].startAt).toEqual(new Date("2026-04-06T08:00:00Z"));
    expect(result[0].endAt).toEqual(new Date("2026-04-06T12:00:00Z"));
  });

  it("should handle effectiveTo as Date object (defense-in-depth)", () => {
    const result = computeAvailability(
      makeInput({
        workingHours: [
          makeWH({
            effectiveFrom: new Date("2026-01-01T00:00:00Z") as any,
            effectiveTo: new Date("2026-04-05T00:00:00Z") as any,
          }),
        ],
      }),
    );

    // effectiveTo is April 5, query date is April 6 → excluded
    expect(result).toHaveLength(0);
  });

  it("should handle entry that fully covers working hours", () => {
    const result = computeAvailability(
      makeInput({
        workingHours: [makeWH()],
        calendarEntries: [
          makeEntry({
            startAt: new Date("2026-04-06T07:00:00Z"),
            endAt: new Date("2026-04-06T13:00:00Z"),
          }),
        ],
      }),
    );

    expect(result).toHaveLength(0);
  });
});
