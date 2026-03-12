import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { GetAvailableSlotsService } from "../get-available-slots.service";

const makePersonal = (overrides = {}) => ({
  id: "personal-1",
  slug: "coach-joao",
  ...overrides,
});

const makeAvailabilitySlot = (overrides = {}) => ({
  id: "slot-1",
  personalId: "personal-1",
  dayOfWeek: 1,
  startTime: "07:00",
  endTime: "08:00",
  isActive: true,
  createdAt: new Date(),
  ...overrides,
});

const makeScheduleRule = (overrides = {}) => ({
  id: "rule-1",
  personalId: "personal-1",
  studentId: "student-1",
  dayOfWeek: 1,
  startTime: "07:00",
  endTime: "08:00",
  sessionType: "presential" as const,
  isActive: true,
  workoutPlanId: "wp-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeTrainingSession = (overrides = {}) => ({
  id: "session-1",
  personalId: "personal-1",
  studentId: "student-1",
  scheduleRuleId: "rule-1",
  scheduledDate: "2026-03-16",
  startTime: "09:00",
  endTime: "10:00",
  status: "pending" as const,
  sessionType: "presential" as const,
  workoutPlanId: "wp-1",
  workoutSessionId: null,
  cancelledAt: null,
  cancellationReason: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("GetAvailableSlotsService", () => {
  let service: GetAvailableSlotsService;
  let personalsRepo: { findBySlug: ReturnType<typeof vi.fn> };
  let availabilityRepo: { findByDay: ReturnType<typeof vi.fn> };
  let scheduleRulesRepo: { findActivePresentialByDay: ReturnType<typeof vi.fn> };
  let trainingSessionsRepo: { findByPersonalAndDateRange: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    personalsRepo = { findBySlug: vi.fn() };
    availabilityRepo = { findByDay: vi.fn().mockResolvedValue([]) };
    scheduleRulesRepo = { findActivePresentialByDay: vi.fn().mockResolvedValue([]) };
    trainingSessionsRepo = { findByPersonalAndDateRange: vi.fn().mockResolvedValue([]) };

    service = new GetAvailableSlotsService(
      personalsRepo as any,
      availabilityRepo as any,
      scheduleRulesRepo as any,
      trainingSessionsRepo as any,
    );
  });

  it("should throw NotFoundException when personal slug does not exist", async () => {
    personalsRepo.findBySlug.mockResolvedValue(null);

    await expect(service.execute("unknown-slug", "2026-03-16"))
      .rejects.toThrow(NotFoundException);
  });

  it("should return empty arrays when personal has no availability configured", async () => {
    personalsRepo.findBySlug.mockResolvedValue(makePersonal());
    availabilityRepo.findByDay.mockResolvedValue([]);

    const result = await service.execute("coach-joao", "2026-03-16");

    expect(result.freeSlots).toEqual([]);
    expect(result.occupiedSlots).toEqual([]);
  });

  it("should return all availability slots as free when no presential sessions exist", async () => {
    personalsRepo.findBySlug.mockResolvedValue(makePersonal());
    availabilityRepo.findByDay.mockResolvedValue([
      makeAvailabilitySlot({ startTime: "07:00", endTime: "08:00" }),
      makeAvailabilitySlot({ id: "slot-2", startTime: "08:00", endTime: "09:00" }),
    ]);
    scheduleRulesRepo.findActivePresentialByDay.mockResolvedValue([]);
    trainingSessionsRepo.findByPersonalAndDateRange.mockResolvedValue([]);

    const result = await service.execute("coach-joao", "2026-03-16");

    expect(result.freeSlots).toHaveLength(2);
    expect(result.occupiedSlots).toHaveLength(0);
  });

  it("should mark slot as occupied when a presential rule covers it", async () => {
    personalsRepo.findBySlug.mockResolvedValue(makePersonal());
    availabilityRepo.findByDay.mockResolvedValue([
      makeAvailabilitySlot({ startTime: "07:00", endTime: "08:00" }),
      makeAvailabilitySlot({ id: "slot-2", startTime: "08:00", endTime: "09:00" }),
    ]);
    scheduleRulesRepo.findActivePresentialByDay.mockResolvedValue([
      makeScheduleRule({ startTime: "07:00", endTime: "08:00" }),
    ]);
    trainingSessionsRepo.findByPersonalAndDateRange.mockResolvedValue([]);

    const result = await service.execute("coach-joao", "2026-03-16");

    expect(result.freeSlots).toHaveLength(1);
    expect(result.freeSlots[0].startTime).toBe("08:00");
    expect(result.occupiedSlots).toHaveLength(1);
    expect(result.occupiedSlots[0].startTime).toBe("07:00");
  });

  it("should mark slot as occupied when a training session on that specific date covers it", async () => {
    personalsRepo.findBySlug.mockResolvedValue(makePersonal());
    availabilityRepo.findByDay.mockResolvedValue([
      makeAvailabilitySlot({ startTime: "09:00", endTime: "10:00" }),
      makeAvailabilitySlot({ id: "slot-2", startTime: "10:00", endTime: "11:00" }),
    ]);
    scheduleRulesRepo.findActivePresentialByDay.mockResolvedValue([]);
    trainingSessionsRepo.findByPersonalAndDateRange.mockResolvedValue([
      makeTrainingSession({ startTime: "09:00", endTime: "10:00" }),
    ]);

    const result = await service.execute("coach-joao", "2026-03-16");

    expect(result.freeSlots).toHaveLength(1);
    expect(result.freeSlots[0].startTime).toBe("10:00");
    expect(result.occupiedSlots).toHaveLength(1);
  });

  it("should ignore inactive availability slots", async () => {
    personalsRepo.findBySlug.mockResolvedValue(makePersonal());
    availabilityRepo.findByDay.mockResolvedValue([
      makeAvailabilitySlot({ startTime: "07:00", endTime: "08:00", isActive: false }),
      makeAvailabilitySlot({ id: "slot-2", startTime: "08:00", endTime: "09:00", isActive: true }),
    ]);
    scheduleRulesRepo.findActivePresentialByDay.mockResolvedValue([]);
    trainingSessionsRepo.findByPersonalAndDateRange.mockResolvedValue([]);

    const result = await service.execute("coach-joao", "2026-03-16");

    expect(result.freeSlots).toHaveLength(1);
    expect(result.freeSlots[0].startTime).toBe("08:00");
  });

  it("should not double-count a slot blocked by both a rule and a session", async () => {
    personalsRepo.findBySlug.mockResolvedValue(makePersonal());
    availabilityRepo.findByDay.mockResolvedValue([
      makeAvailabilitySlot({ startTime: "07:00", endTime: "08:00" }),
    ]);
    scheduleRulesRepo.findActivePresentialByDay.mockResolvedValue([
      makeScheduleRule({ startTime: "07:00", endTime: "08:00" }),
    ]);
    trainingSessionsRepo.findByPersonalAndDateRange.mockResolvedValue([
      makeTrainingSession({ startTime: "07:00", endTime: "08:00" }),
    ]);

    const result = await service.execute("coach-joao", "2026-03-16");

    expect(result.freeSlots).toHaveLength(0);
    expect(result.occupiedSlots).toHaveLength(1);
  });

  it("should ignore cancelled training sessions when computing occupation", async () => {
    personalsRepo.findBySlug.mockResolvedValue(makePersonal());
    availabilityRepo.findByDay.mockResolvedValue([
      makeAvailabilitySlot({ startTime: "09:00", endTime: "10:00" }),
    ]);
    scheduleRulesRepo.findActivePresentialByDay.mockResolvedValue([]);
    trainingSessionsRepo.findByPersonalAndDateRange.mockResolvedValue([
      makeTrainingSession({ startTime: "09:00", endTime: "10:00", status: "cancelled" }),
    ]);

    const result = await service.execute("coach-joao", "2026-03-16");

    expect(result.freeSlots).toHaveLength(1);
    expect(result.occupiedSlots).toHaveLength(0);
  });
});
