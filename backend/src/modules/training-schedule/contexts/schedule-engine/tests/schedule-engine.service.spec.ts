import { describe, it, expect, beforeEach, vi } from "vitest";
import { ScheduleEngineService } from "../schedule-engine.service";

const makeRule = (overrides = {}) => ({
  id: "rule-1",
  personalId: "personal-1",
  studentId: "student-1",
  dayOfWeek: 1, // Monday
  workoutPlanId: "wp-1",
  sessionType: "online" as const,
  startTime: null as string | null,
  endTime: null as string | null,
  isActive: true,
  createdAt: new Date("2026-03-12"),
  updatedAt: new Date("2026-03-12"),
  ...overrides,
});

describe("ScheduleEngineService", () => {
  let service: ScheduleEngineService;
  let scheduleRulesRepo: { findAllActive: ReturnType<typeof vi.fn> };
  let trainingSessionsRepo: {
    createManyIgnoreDuplicates: ReturnType<typeof vi.fn>;
    deletePendingFutureByRule: ReturnType<typeof vi.fn>;
  };
  let availabilityRepo: {
    hasActiveForDay: ReturnType<typeof vi.fn>;
    findCovering: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    scheduleRulesRepo = { findAllActive: vi.fn() };
    trainingSessionsRepo = {
      createManyIgnoreDuplicates: vi.fn().mockResolvedValue([]),
      deletePendingFutureByRule: vi.fn().mockResolvedValue(undefined),
    };
    availabilityRepo = {
      hasActiveForDay: vi.fn().mockResolvedValue(false),
      findCovering: vi.fn().mockResolvedValue(null),
    };
    service = new ScheduleEngineService(
      scheduleRulesRepo as any,
      trainingSessionsRepo as any,
      availabilityRepo as any,
    );
  });

  // ─── generateSessionDates ──────────────────────────────────────────────────

  describe("generateSessionDates", () => {
    it("should return dates only for the given day of week", () => {
      // Reference: 2026-03-12 (Thursday = 4), requesting Monday = 1
      const ref = new Date("2026-03-12T12:00:00Z");
      const dates = service.generateSessionDates(1, ref);

      expect(dates.length).toBeGreaterThan(0);
      dates.forEach((d) => {
        expect(new Date(d + "T00:00:00Z").getUTCDay()).toBe(1);
      });
    });

    it("should include today when the rule matches today's day of week", () => {
      // 2026-03-12T12:00:00Z = Thursday UTC = Thursday Brazil (09:00 Brasília)
      const ref = new Date("2026-03-12T12:00:00Z");
      const dates = service.generateSessionDates(4, ref); // dayOfWeek 4 = Thursday

      expect(dates).toContain("2026-03-12");
    });

    it("should not include today when rule does not match today's day of week", () => {
      const ref = new Date("2026-03-12T12:00:00Z"); // Thursday
      const dates = service.generateSessionDates(1, ref); // requesting Monday

      expect(dates).not.toContain("2026-03-12");
    });

    it("should generate dates within the 60-day window", () => {
      const ref = new Date("2026-03-12T12:00:00Z");
      const dates = service.generateSessionDates(1, ref);

      const limit = new Date("2026-03-12T12:00:00Z");
      limit.setDate(limit.getDate() + 60);
      const limitStr = limit.toISOString().split("T")[0];

      dates.forEach((d) => {
        expect(d <= limitStr).toBe(true);
      });
    });

    it("should generate approximately 8-9 dates within 60 days for a weekly rule", () => {
      const ref = new Date("2026-03-12T12:00:00Z");
      const dates = service.generateSessionDates(1, ref);
      // 60 days / 7 ≈ 8-9 mondays
      expect(dates.length).toBeGreaterThanOrEqual(8);
      expect(dates.length).toBeLessThanOrEqual(9);
    });

    it("should return empty array when day of week never appears in range (impossible, but defensive)", () => {
      // This is a sanity check — every day of week appears ~8 times in 60 days
      const ref = new Date("2026-03-12T12:00:00Z");
      const dates = service.generateSessionDates(3, ref); // Wednesday
      expect(Array.isArray(dates)).toBe(true);
    });
  });

  // ─── buildSessionPayloads ─────────────────────────────────────────────────

  describe("buildSessionPayloads", () => {
    it("should build one payload per date with correct fields", () => {
      const rule = makeRule();
      const dates = ["2026-03-16", "2026-03-23"];

      const payloads = service.buildSessionPayloads(rule, dates);

      expect(payloads).toHaveLength(2);
      expect(payloads[0]).toMatchObject({
        personalId: "personal-1",
        studentId: "student-1",
        scheduleRuleId: "rule-1",
        workoutPlanId: "wp-1",
        scheduledDate: "2026-03-16",
        startTime: null,
        endTime: null,
        sessionType: "online",
        status: "pending",
      });
    });

    it("should propagate startTime and endTime from rule for presential sessions", () => {
      const rule = makeRule({
        sessionType: "presential",
        startTime: "07:00",
        endTime: "08:00",
      });
      const payloads = service.buildSessionPayloads(rule, ["2026-03-16"]);

      expect(payloads[0].startTime).toBe("07:00");
      expect(payloads[0].endTime).toBe("08:00");
    });

    it("should set workoutPlanId to null for rest day rules", () => {
      const rule = makeRule({ workoutPlanId: null, sessionType: "rest" });
      const payloads = service.buildSessionPayloads(rule, ["2026-03-16"]);

      expect(payloads[0].workoutPlanId).toBeNull();
      expect(payloads[0].sessionType).toBe("rest");
    });
  });

  // ─── expandRules ──────────────────────────────────────────────────────────

  describe("expandRules", () => {
    it("should call createManyIgnoreDuplicates for each active rule", async () => {
      const rules = [makeRule({ id: "rule-1" }), makeRule({ id: "rule-2", dayOfWeek: 3 })];
      scheduleRulesRepo.findAllActive.mockResolvedValue(rules);

      await service.expandRules();

      expect(trainingSessionsRepo.createManyIgnoreDuplicates).toHaveBeenCalledTimes(2);
    });

    it("should not call createManyIgnoreDuplicates when there are no active rules", async () => {
      scheduleRulesRepo.findAllActive.mockResolvedValue([]);

      await service.expandRules();

      expect(trainingSessionsRepo.createManyIgnoreDuplicates).not.toHaveBeenCalled();
    });

    it("should skip a rule if it generates no dates (e.g., all dates already exist — handled by onConflict)", async () => {
      scheduleRulesRepo.findAllActive.mockResolvedValue([makeRule()]);
      trainingSessionsRepo.createManyIgnoreDuplicates.mockResolvedValue([]);

      await expect(service.expandRules()).resolves.not.toThrow();
    });
  });

  // ─── syncRule ────────────────────────────────────────────────────────────

  describe("syncRule", () => {
    it("should delete pending future sessions then recreate them", async () => {
      const rule = makeRule();

      await service.syncRule(rule);

      expect(trainingSessionsRepo.deletePendingFutureByRule).toHaveBeenCalledWith("rule-1");
      expect(trainingSessionsRepo.createManyIgnoreDuplicates).toHaveBeenCalled();
    });

    it("should call deletePendingFutureByRule before creating new sessions", async () => {
      const callOrder: string[] = [];
      trainingSessionsRepo.deletePendingFutureByRule.mockImplementation(async () => {
        callOrder.push("delete");
      });
      trainingSessionsRepo.createManyIgnoreDuplicates.mockImplementation(async () => {
        callOrder.push("create");
        return [];
      });

      await service.syncRule(makeRule());

      expect(callOrder).toEqual(["delete", "create"]);
    });
  });

  // ─── isPresentialCoveredByAvailability ───────────────────────────────────

  describe("isPresentialCoveredByAvailability", () => {
    it("should return true when no active slots exist for the day (no restriction applies)", async () => {
      availabilityRepo.hasActiveForDay.mockResolvedValue(false);

      const result = await service.isPresentialCoveredByAvailability(
        "personal-1",
        1,
        "07:00",
        "08:00",
      );

      expect(result).toBe(true);
      expect(availabilityRepo.findCovering).not.toHaveBeenCalled();
    });

    it("should return true when availability slot covers the presential time range", async () => {
      availabilityRepo.hasActiveForDay.mockResolvedValue(true);
      availabilityRepo.findCovering.mockResolvedValue({ id: "slot-1", startTime: "06:00", endTime: "10:00" });

      const result = await service.isPresentialCoveredByAvailability(
        "personal-1",
        1,
        "07:00",
        "08:00",
      );

      expect(result).toBe(true);
      expect(availabilityRepo.findCovering).toHaveBeenCalledWith("personal-1", 1, "07:00", "08:00");
    });

    it("should return false when slots exist for the day but none covers the requested time", async () => {
      availabilityRepo.hasActiveForDay.mockResolvedValue(true);
      availabilityRepo.findCovering.mockResolvedValue(null);

      const result = await service.isPresentialCoveredByAvailability(
        "personal-1",
        1,
        "07:00",
        "08:00",
      );

      expect(result).toBe(false);
    });
  });
});
