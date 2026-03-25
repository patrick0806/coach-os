import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, HttpException } from "@nestjs/common";

import { CreateEventUseCase } from "../createEvent.useCase";

// Mock the shared utils at the correct path from the use case file
vi.mock("../../../../shared/conflictDetectionV2.util", () => ({
  detectConflictsV2: vi.fn().mockReturnValue([]),
}));

vi.mock("../../../../shared/calendarPipeline.util", () => ({
  buildCalendar: vi.fn().mockReturnValue([]),
}));

import { detectConflictsV2 } from "../../../../shared/conflictDetectionV2.util";
import { buildCalendar } from "../../../../shared/calendarPipeline.util";

const EVENT_ID = "event-id-1";
const TENANT_ID = "tenant-id-1";
const STUDENT_ID = "student-id-1";

const makeEvent = (overrides = {}) => ({
  id: EVENT_ID,
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
  location: "Academia XYZ",
  notes: null,
  cancelledAt: null,
  cancellationReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeCalendarEventsRepository = () => ({
  create: vi.fn().mockResolvedValue(makeEvent()),
  findByDateRange: vi.fn().mockResolvedValue([]),
});

const makeRecurringSlotsRepository = () => ({
  findActiveInDateRange: vi.fn().mockResolvedValue([]),
});

const makeWorkingHoursRepository = () => ({
  findActiveInDateRange: vi.fn().mockResolvedValue([]),
});

describe("CreateEventUseCase", () => {
  let useCase: CreateEventUseCase;
  let calendarEventsRepository: ReturnType<typeof makeCalendarEventsRepository>;
  let recurringSlotsRepository: ReturnType<typeof makeRecurringSlotsRepository>;
  let workingHoursRepository: ReturnType<typeof makeWorkingHoursRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    calendarEventsRepository = makeCalendarEventsRepository();
    recurringSlotsRepository = makeRecurringSlotsRepository();
    workingHoursRepository = makeWorkingHoursRepository();

    useCase = new CreateEventUseCase(
      calendarEventsRepository as any,
      recurringSlotsRepository as any,
      workingHoursRepository as any,
    );
  });

  it("should create a one_off event successfully", async () => {
    const result = await useCase.execute(
      {
        type: "one_off",
        startAt: "2026-04-06T10:00:00Z",
        endAt: "2026-04-06T11:00:00Z",
        studentId: STUDENT_ID,
        appointmentType: "presential",
        location: "Academia XYZ",
      },
      TENANT_ID,
    );

    expect(result.id).toBe(EVENT_ID);
    expect(calendarEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        type: "one_off",
        status: "scheduled",
        studentId: STUDENT_ID,
      }),
    );
  });

  it("should create a block event without studentId", async () => {
    const result = await useCase.execute(
      {
        type: "block",
        startAt: "2026-04-06T10:00:00Z",
        endAt: "2026-04-06T11:00:00Z",
      },
      TENANT_ID,
    );

    expect(result.id).toBe(EVENT_ID);
  });

  it("should create an override event successfully", async () => {
    const result = await useCase.execute(
      {
        type: "override",
        startAt: "2026-04-06T10:00:00Z",
        endAt: "2026-04-06T11:00:00Z",
        studentId: STUDENT_ID,
        recurringSlotId: "slot-id-1",
        originalStartAt: "2026-04-06T10:00:00Z",
      },
      TENANT_ID,
    );

    expect(result.id).toBe(EVENT_ID);
  });

  it("should throw BadRequestException when startAt >= endAt", async () => {
    await expect(
      useCase.execute(
        {
          type: "one_off",
          startAt: "2026-04-06T11:00:00Z",
          endAt: "2026-04-06T10:00:00Z",
          studentId: STUDENT_ID,
          appointmentType: "presential",
          location: "Academia",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should create one_off event without studentId", async () => {
    const result = await useCase.execute(
      {
        type: "one_off",
        startAt: "2026-04-06T10:00:00Z",
        endAt: "2026-04-06T11:00:00Z",
        appointmentType: "presential",
        location: "Academia",
      },
      TENANT_ID,
    );

    expect(result.id).toBe(EVENT_ID);
  });

  it("should throw validation error when recurringSlotId missing for override", async () => {
    await expect(
      useCase.execute(
        {
          type: "override",
          startAt: "2026-04-06T10:00:00Z",
          endAt: "2026-04-06T11:00:00Z",
          studentId: STUDENT_ID,
          originalStartAt: "2026-04-06T10:00:00Z",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw validation error when originalStartAt missing for override", async () => {
    await expect(
      useCase.execute(
        {
          type: "override",
          startAt: "2026-04-06T10:00:00Z",
          endAt: "2026-04-06T11:00:00Z",
          studentId: STUDENT_ID,
          recurringSlotId: "slot-id-1",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should create one_off event without appointmentType", async () => {
    const result = await useCase.execute(
      {
        type: "one_off",
        startAt: "2026-04-06T10:00:00Z",
        endAt: "2026-04-06T11:00:00Z",
        studentId: STUDENT_ID,
      },
      TENANT_ID,
    );

    expect(result.id).toBe(EVENT_ID);
  });

  it("should create online event without meetingUrl", async () => {
    const result = await useCase.execute(
      {
        type: "one_off",
        startAt: "2026-04-06T10:00:00Z",
        endAt: "2026-04-06T11:00:00Z",
        studentId: STUDENT_ID,
        appointmentType: "online",
      },
      TENANT_ID,
    );

    expect(result.id).toBe(EVENT_ID);
  });

  it("should throw HttpException 409 when conflicts detected and forceCreate is false", async () => {
    const mockConflicts = [
      { type: "overlap", message: "Conflicts with existing event" },
    ];
    vi.mocked(detectConflictsV2).mockReturnValue(mockConflicts as any);

    try {
      await useCase.execute(
        {
          type: "one_off",
          startAt: "2026-04-06T10:00:00Z",
          endAt: "2026-04-06T11:00:00Z",
          studentId: STUDENT_ID,
          appointmentType: "presential",
          location: "Academia",
        },
        TENANT_ID,
      );
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(409);
      expect((error as HttpException).getResponse()).toEqual({ conflicts: mockConflicts });
    }
  });

  it("should allow forceCreate to override conflicts", async () => {
    vi.mocked(detectConflictsV2).mockReturnValue([
      { type: "overlap", message: "Conflicts with existing event" },
    ] as any);

    const result = await useCase.execute(
      {
        type: "one_off",
        startAt: "2026-04-06T10:00:00Z",
        endAt: "2026-04-06T11:00:00Z",
        studentId: STUDENT_ID,
        appointmentType: "presential",
        location: "Academia",
        forceCreate: true,
      },
      TENANT_ID,
    );

    expect(result.id).toBe(EVENT_ID);
    expect(calendarEventsRepository.create).toHaveBeenCalled();
  });

  it("should call buildCalendar and detectConflictsV2 with correct params", async () => {
    vi.mocked(detectConflictsV2).mockReturnValue([]);

    await useCase.execute(
      {
        type: "one_off",
        startAt: "2026-04-06T10:00:00Z",
        endAt: "2026-04-06T11:00:00Z",
        studentId: STUDENT_ID,
        appointmentType: "presential",
        location: "Academia",
      },
      TENANT_ID,
    );

    expect(buildCalendar).toHaveBeenCalledWith(
      expect.objectContaining({
        recurringSlots: [],
        calendarEvents: [],
      }),
    );

    expect(detectConflictsV2).toHaveBeenCalledWith(
      expect.objectContaining({
        proposedStartAt: new Date("2026-04-06T10:00:00Z"),
        proposedEndAt: new Date("2026-04-06T11:00:00Z"),
        workingHours: [],
        calendarEntries: [],
      }),
    );
  });
});
