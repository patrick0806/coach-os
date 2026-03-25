import { describe, it, expect } from "vitest";

import { buildCalendar, CalendarPipelineInput } from "../calendarPipeline.util";
import type { RecurringSlot } from "@shared/repositories/recurringSlots.repository";
import type { CalendarEvent } from "@shared/repositories/calendarEvents.repository";

const TENANT_ID = "tenant-1";

const makeSlot = (overrides: Partial<RecurringSlot> = {}): RecurringSlot => ({
  id: "slot-1",
  tenantId: TENANT_ID,
  studentId: "student-1",
  studentProgramId: null,
  type: "booking",
  dayOfWeek: 1, // Monday
  startTime: "10:00",
  endTime: "11:00",
  location: "Gym A",
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: "event-1",
  tenantId: TENANT_ID,
  studentId: "student-1",
  startAt: new Date("2026-04-06T14:00:00Z"),
  endAt: new Date("2026-04-06T15:00:00Z"),
  type: "one_off",
  recurringSlotId: null,
  originalStartAt: null,
  status: "scheduled",
  appointmentType: "presential",
  meetingUrl: null,
  location: "Office",
  notes: null,
  cancelledAt: null,
  cancellationReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeInput = (overrides: Partial<CalendarPipelineInput> = {}): CalendarPipelineInput => ({
  recurringSlots: [],
  calendarEvents: [],
  startDate: new Date("2026-04-06T00:00:00Z"), // Monday
  endDate: new Date("2026-04-12T23:59:59Z"), // Sunday
  ...overrides,
});

describe("buildCalendar", () => {
  it("should return empty array when no slots or events", () => {
    const result = buildCalendar(makeInput());
    expect(result).toEqual([]);
  });

  it("should expand a recurring slot for matching days in range", () => {
    const result = buildCalendar(
      makeInput({
        recurringSlots: [makeSlot({ dayOfWeek: 1 })], // Monday
      }),
    );

    // Only 1 Monday in 2026-04-06 to 2026-04-12
    expect(result).toHaveLength(1);
    expect(result[0].startAt).toEqual(new Date("2026-04-06T10:00:00Z"));
    expect(result[0].endAt).toEqual(new Date("2026-04-06T11:00:00Z"));
    expect(result[0].source).toBe("recurring_slot");
    expect(result[0].type).toBe("booking");
    expect(result[0].location).toBe("Gym A");
  });

  it("should not expand slots outside effectiveFrom/To range", () => {
    const result = buildCalendar(
      makeInput({
        recurringSlots: [
          makeSlot({ effectiveFrom: "2026-05-01" }), // future
        ],
      }),
    );

    expect(result).toHaveLength(0);
  });

  it("should not expand inactive slots", () => {
    const result = buildCalendar(
      makeInput({
        recurringSlots: [makeSlot({ isActive: false })],
      }),
    );

    expect(result).toHaveLength(0);
  });

  it("should apply cancelled override (skip instance)", () => {
    const slot = makeSlot();
    const result = buildCalendar(
      makeInput({
        recurringSlots: [slot],
        calendarEvents: [
          makeEvent({
            id: "override-1",
            type: "override",
            recurringSlotId: slot.id,
            originalStartAt: new Date("2026-04-06T10:00:00Z"),
            startAt: new Date("2026-04-06T10:00:00Z"),
            endAt: new Date("2026-04-06T11:00:00Z"),
            status: "cancelled",
          }),
        ],
      }),
    );

    // Instance should be skipped
    expect(result).toHaveLength(0);
  });

  it("should apply rescheduled override (move instance)", () => {
    const slot = makeSlot();
    const result = buildCalendar(
      makeInput({
        recurringSlots: [slot],
        calendarEvents: [
          makeEvent({
            id: "override-1",
            type: "override",
            recurringSlotId: slot.id,
            originalStartAt: new Date("2026-04-06T10:00:00Z"),
            startAt: new Date("2026-04-07T14:00:00Z"), // Moved to Tuesday
            endAt: new Date("2026-04-07T15:00:00Z"),
            status: "scheduled",
          }),
        ],
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].startAt).toEqual(new Date("2026-04-07T14:00:00Z"));
    expect(result[0].isOverride).toBe(true);
    expect(result[0].source).toBe("calendar_event");
  });

  it("should include one_off events", () => {
    const result = buildCalendar(
      makeInput({
        calendarEvents: [makeEvent({ type: "one_off" })],
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("one_off");
    expect(result[0].source).toBe("calendar_event");
  });

  it("should include block events", () => {
    const result = buildCalendar(
      makeInput({
        calendarEvents: [
          makeEvent({
            type: "block",
            studentId: null,
            startAt: new Date("2026-04-08T00:00:00Z"),
            endAt: new Date("2026-04-08T23:59:59Z"),
          }),
        ],
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("block");
  });

  it("should sort entries by startAt", () => {
    const result = buildCalendar(
      makeInput({
        calendarEvents: [
          makeEvent({ id: "e2", startAt: new Date("2026-04-08T16:00:00Z"), endAt: new Date("2026-04-08T17:00:00Z") }),
          makeEvent({ id: "e1", startAt: new Date("2026-04-06T09:00:00Z"), endAt: new Date("2026-04-06T10:00:00Z") }),
        ],
      }),
    );

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("e1");
    expect(result[1].id).toBe("e2");
  });

  it("should expand slot with effectiveTo in range", () => {
    const result = buildCalendar(
      makeInput({
        recurringSlots: [
          makeSlot({ effectiveTo: "2026-04-07" }), // Expires Tuesday
        ],
      }),
    );

    // Monday is within range, so 1 entry
    expect(result).toHaveLength(1);
  });

  it("should mix recurring slots and one_off events correctly", () => {
    const result = buildCalendar(
      makeInput({
        recurringSlots: [makeSlot()],
        calendarEvents: [
          makeEvent({
            id: "one-off-1",
            type: "one_off",
            startAt: new Date("2026-04-06T14:00:00Z"),
            endAt: new Date("2026-04-06T15:00:00Z"),
          }),
        ],
      }),
    );

    expect(result).toHaveLength(2);
    expect(result[0].startAt).toEqual(new Date("2026-04-06T10:00:00Z")); // recurring
    expect(result[1].startAt).toEqual(new Date("2026-04-06T14:00:00Z")); // one_off
  });

  it("should resolve student names from map", () => {
    const studentNames = new Map([["student-1", "João Silva"]]);

    const result = buildCalendar(
      makeInput({
        recurringSlots: [makeSlot()],
        studentNames,
      }),
    );

    expect(result[0].studentName).toBe("João Silva");
  });
});
