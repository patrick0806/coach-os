import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UpsertScheduleRulesService } from "../upsert-schedule-rules.service";

const mockUser = { sub: "user-1", role: "PERSONAL", profileId: "personal-1", personalId: "personal-1", personalSlug: "coach" };
const studentId = "student-1";

const makePayload = (overrides = {}) => ({
  days: [
    { dayOfWeek: 1, sessionType: "online" as const, workoutPlanId: "wp-1", scheduledTime: null },
    { dayOfWeek: 3, sessionType: "presential" as const, workoutPlanId: "wp-2", scheduledTime: "07:00" },
    { dayOfWeek: 5, sessionType: "rest" as const, workoutPlanId: null, scheduledTime: null },
  ],
  ...overrides,
});

describe("UpsertScheduleRulesService", () => {
  let service: UpsertScheduleRulesService;
  let studentsRepo: { findById: ReturnType<typeof vi.fn> };
  let scheduleRulesRepo: { upsert: ReturnType<typeof vi.fn> };
  let scheduleEngine: { syncRule: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepo = { findById: vi.fn() };
    scheduleRulesRepo = { upsert: vi.fn() };
    scheduleEngine = { syncRule: vi.fn().mockResolvedValue(undefined) };
    service = new UpsertScheduleRulesService(
      studentsRepo as any,
      scheduleRulesRepo as any,
      scheduleEngine as any,
    );
  });

  it("should throw NotFoundException when student does not belong to personal", async () => {
    studentsRepo.findById.mockResolvedValue(null);
    await expect(service.execute(makePayload(), studentId, mockUser as any))
      .rejects.toThrow(NotFoundException);
  });

  it("should upsert one rule per day entry", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const fakeRule = { id: "rule-1", studentId, personalId: "personal-1", dayOfWeek: 1 };
    scheduleRulesRepo.upsert.mockResolvedValue(fakeRule);

    await service.execute(makePayload(), studentId, mockUser as any);

    expect(scheduleRulesRepo.upsert).toHaveBeenCalledTimes(3);
  });

  it("should call syncRule for each upserted rule", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const fakeRule = { id: "rule-1", studentId, personalId: "personal-1", dayOfWeek: 1 };
    scheduleRulesRepo.upsert.mockResolvedValue(fakeRule);

    await service.execute(makePayload(), studentId, mockUser as any);

    expect(scheduleEngine.syncRule).toHaveBeenCalledTimes(3);
  });

  it("should return upserted rules", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const fakeRule = { id: "rule-1", studentId, personalId: "personal-1", dayOfWeek: 1 };
    scheduleRulesRepo.upsert.mockResolvedValue(fakeRule);

    const result = await service.execute(makePayload(), studentId, mockUser as any);
    expect(result).toHaveLength(3);
  });

  it("should throw BadRequestException when rest day has workoutPlanId set", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const badPayload = makePayload({
      days: [{ dayOfWeek: 1, sessionType: "rest", workoutPlanId: "wp-1", scheduledTime: null }],
    });
    await expect(service.execute(badPayload, studentId, mockUser as any))
      .rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when training day has no workoutPlanId", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const badPayload = makePayload({
      days: [{ dayOfWeek: 1, sessionType: "online", workoutPlanId: null, scheduledTime: null }],
    });
    await expect(service.execute(badPayload, studentId, mockUser as any))
      .rejects.toThrow(BadRequestException);
  });
});
