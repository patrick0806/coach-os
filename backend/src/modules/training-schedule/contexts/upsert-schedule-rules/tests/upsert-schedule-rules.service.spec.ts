import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException, ConflictException } from "@nestjs/common";
import { UpsertScheduleRulesService } from "../upsert-schedule-rules.service";

const mockUser = { sub: "user-1", role: "PERSONAL", profileId: "personal-1", personalId: "personal-1", personalSlug: "coach" };
const studentId = "student-1";

const makePayload = (overrides = {}) => ({
  days: [
    { dayOfWeek: 1, sessionType: "online" as const, workoutPlanId: "wp-1", startTime: null, endTime: null },
    { dayOfWeek: 3, sessionType: "presential" as const, workoutPlanId: "wp-2", startTime: "07:00", endTime: "08:00" },
    { dayOfWeek: 5, sessionType: "rest" as const, workoutPlanId: null, startTime: null, endTime: null },
  ],
  ...overrides,
});

describe("UpsertScheduleRulesService", () => {
  let service: UpsertScheduleRulesService;
  let studentsRepo: { findById: ReturnType<typeof vi.fn> };
  let scheduleRulesRepo: { upsert: ReturnType<typeof vi.fn>; findConflictingRules: ReturnType<typeof vi.fn> };
  let scheduleEngine: {
    syncRule: ReturnType<typeof vi.fn>;
    isPresentialCoveredByAvailability: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    studentsRepo = { findById: vi.fn() };
    scheduleRulesRepo = { upsert: vi.fn(), findConflictingRules: vi.fn().mockResolvedValue([]) };
    scheduleEngine = {
      syncRule: vi.fn().mockResolvedValue(undefined),
      isPresentialCoveredByAvailability: vi.fn().mockResolvedValue(true),
    };
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
      days: [{ dayOfWeek: 1, sessionType: "rest", workoutPlanId: "wp-1", startTime: null, endTime: null }],
    });
    await expect(service.execute(badPayload, studentId, mockUser as any))
      .rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when training day has no workoutPlanId", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const badPayload = makePayload({
      days: [{ dayOfWeek: 1, sessionType: "online", workoutPlanId: null, startTime: null, endTime: null }],
    });
    await expect(service.execute(badPayload, studentId, mockUser as any))
      .rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when presential day has no startTime", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const badPayload = makePayload({
      days: [{ dayOfWeek: 3, sessionType: "presential", workoutPlanId: "wp-2", startTime: null, endTime: "08:00" }],
    });
    await expect(service.execute(badPayload, studentId, mockUser as any))
      .rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when presential day has no endTime", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const badPayload = makePayload({
      days: [{ dayOfWeek: 3, sessionType: "presential", workoutPlanId: "wp-2", startTime: "07:00", endTime: null }],
    });
    await expect(service.execute(badPayload, studentId, mockUser as any))
      .rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when presential time is outside availability", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    scheduleEngine.isPresentialCoveredByAvailability.mockResolvedValue(false);

    const payload = makePayload({
      days: [{ dayOfWeek: 3, sessionType: "presential", workoutPlanId: "wp-2", startTime: "07:00", endTime: "08:00" }],
    });

    await expect(service.execute(payload, studentId, mockUser as any))
      .rejects.toThrow(BadRequestException);
  });

  it("should throw ConflictException when presential time overlaps with another student's session", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    scheduleRulesRepo.findConflictingRules.mockResolvedValue([
      { startTime: "07:30", endTime: "08:30" }
    ]);

    const payload = makePayload({
      days: [{ dayOfWeek: 3, sessionType: "presential", workoutPlanId: "wp-2", startTime: "07:00", endTime: "08:00" }],
    });

    await expect(service.execute(payload, studentId, mockUser as any))
      .rejects.toThrow(ConflictException);
  });

  it("should not validate availability for online sessions", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const fakeRule = { id: "rule-1", studentId, personalId: "personal-1", dayOfWeek: 1 };
    scheduleRulesRepo.upsert.mockResolvedValue(fakeRule);

    const payload = makePayload({
      days: [{ dayOfWeek: 1, sessionType: "online", workoutPlanId: "wp-1", startTime: null, endTime: null }],
    });

    await service.execute(payload, studentId, mockUser as any);

    expect(scheduleEngine.isPresentialCoveredByAvailability).not.toHaveBeenCalled();
  });

  it("should pass startTime and endTime to upsert for presential sessions", async () => {
    studentsRepo.findById.mockResolvedValue({ id: studentId, personalId: "personal-1" });
    const fakeRule = { id: "rule-1", studentId, personalId: "personal-1", dayOfWeek: 3 };
    scheduleRulesRepo.upsert.mockResolvedValue(fakeRule);

    const payload = makePayload({
      days: [{ dayOfWeek: 3, sessionType: "presential", workoutPlanId: "wp-2", startTime: "07:00", endTime: "08:00" }],
    });

    await service.execute(payload, studentId, mockUser as any);

    expect(scheduleRulesRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ startTime: "07:00", endTime: "08:00" }),
    );
  });
});
