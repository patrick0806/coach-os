import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, BadRequestException, HttpException } from "@nestjs/common";

import { UpdateEventUseCase } from "../updateEvent.useCase";

// Mock the shared utils at the correct path from the use case file
vi.mock("../../../../shared/conflictDetectionV2.util", () => ({
  detectConflictsV2: vi.fn().mockReturnValue([]),
}));

vi.mock("../../../../shared/calendarPipeline.util", () => ({
  buildCalendar: vi.fn().mockReturnValue([]),
}));

import { detectConflictsV2 } from "../../../../shared/conflictDetectionV2.util";

const EVENT_ID = "event-id-1";
const TENANT_ID = "tenant-id-1";

const makeEvent = (overrides = {}) => ({
  id: EVENT_ID,
  tenantId: TENANT_ID,
  studentId: "student-id-1",
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
  findById: vi.fn().mockResolvedValue(makeEvent()),
  update: vi.fn().mockResolvedValue(makeEvent({ notes: "Updated" })),
  findByDateRange: vi.fn().mockResolvedValue([]),
});

const makeRecurringSlotsRepository = () => ({
  findActiveInDateRange: vi.fn().mockResolvedValue([]),
});

const makeWorkingHoursRepository = () => ({
  findActiveInDateRange: vi.fn().mockResolvedValue([]),
});

describe("UpdateEventUseCase", () => {
  let useCase: UpdateEventUseCase;
  let calendarEventsRepository: ReturnType<typeof makeCalendarEventsRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    calendarEventsRepository = makeCalendarEventsRepository();

    useCase = new UpdateEventUseCase(
      calendarEventsRepository as any,
      makeRecurringSlotsRepository() as any,
      makeWorkingHoursRepository() as any,
    );
  });

  it("should update event notes successfully", async () => {
    const result = await useCase.execute(
      EVENT_ID,
      { notes: "Updated" },
      TENANT_ID,
    );

    expect(result.notes).toBe("Updated");
    expect(calendarEventsRepository.update).toHaveBeenCalledWith(
      EVENT_ID,
      TENANT_ID,
      expect.objectContaining({ notes: "Updated" }),
    );
  });

  it("should throw NotFoundException when event not found", async () => {
    calendarEventsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(EVENT_ID, { notes: "test" }, TENANT_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when startAt >= endAt", async () => {
    await expect(
      useCase.execute(
        EVENT_ID,
        {
          startAt: "2026-04-06T12:00:00Z",
          endAt: "2026-04-06T11:00:00Z",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should run conflict detection when dates change", async () => {
    await useCase.execute(
      EVENT_ID,
      { startAt: "2026-04-06T14:00:00Z", endAt: "2026-04-06T15:00:00Z" },
      TENANT_ID,
    );

    expect(detectConflictsV2).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeEventId: EVENT_ID,
      }),
    );
  });

  it("should not run conflict detection when only notes change", async () => {
    await useCase.execute(
      EVENT_ID,
      { notes: "Just a note" },
      TENANT_ID,
    );

    expect(detectConflictsV2).not.toHaveBeenCalled();
  });

  it("should throw HttpException 409 when conflicts and no forceCreate", async () => {
    vi.mocked(detectConflictsV2).mockReturnValue([
      { type: "overlap", message: "Conflicts" },
    ] as any);

    try {
      await useCase.execute(
        EVENT_ID,
        { startAt: "2026-04-06T14:00:00Z", endAt: "2026-04-06T15:00:00Z" },
        TENANT_ID,
      );
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(409);
    }
  });

  it("should allow forceCreate to override conflicts on update", async () => {
    vi.mocked(detectConflictsV2).mockReturnValue([
      { type: "overlap", message: "Conflicts" },
    ] as any);

    await useCase.execute(
      EVENT_ID,
      {
        startAt: "2026-04-06T14:00:00Z",
        endAt: "2026-04-06T15:00:00Z",
        forceCreate: true,
      },
      TENANT_ID,
    );

    expect(calendarEventsRepository.update).toHaveBeenCalled();
  });
});
