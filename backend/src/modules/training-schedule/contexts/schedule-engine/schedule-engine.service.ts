import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { ScheduleRulesRepository } from "@shared/repositories/schedule-rules.repository";
import { TrainingSessionsRepository, CreateTrainingSessionInput } from "@shared/repositories/training-sessions.repository";
import { AvailabilityRepository } from "@shared/repositories/availability.repository";
import { ScheduleRule } from "@config/database/schema/schedule";

// How many days ahead to generate training sessions
const SCHEDULE_HORIZON_DAYS = 60;

@Injectable()
export class ScheduleEngineService {
  private readonly logger = new Logger(ScheduleEngineService.name);

  constructor(
    private scheduleRulesRepository: ScheduleRulesRepository,
    private trainingSessionsRepository: TrainingSessionsRepository,
    private availabilityRepository: AvailabilityRepository,
  ) {}

  // Runs daily at midnight — expands all active rules into concrete training sessions
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expandRules(): Promise<void> {
    this.logger.log("Starting schedule expansion...");

    const rules = await this.scheduleRulesRepository.findAllActive();

    if (rules.length === 0) {
      this.logger.log("No active schedule rules found. Skipping.");
      return;
    }

    for (const rule of rules) {
      await this.processRule(rule);
    }

    this.logger.log(`Schedule expansion completed. Processed ${rules.length} rules.`);
  }

  // Called when a rule is updated — clears pending future sessions and regenerates them
  async syncRule(rule: ScheduleRule): Promise<void> {
    await this.trainingSessionsRepository.deletePendingFutureByRule(rule.id);
    await this.processRule(rule);
  }

  // Returns true if:
  //   - The personal has no active availability slots for that day (no restriction applies), OR
  //   - A slot exists that fully covers [startTime, endTime].
  // Returns false only when slots exist for the day but none covers the requested time.
  async isPresentialCoveredByAvailability(
    personalId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const hasSlots = await this.availabilityRepository.hasActiveForDay(personalId, dayOfWeek);
    if (!hasSlots) return true;

    const coveringSlot = await this.availabilityRepository.findCovering(
      personalId,
      dayOfWeek,
      startTime,
      endTime,
    );
    return coveringSlot !== null;
  }

  // Generates the concrete session payloads for a rule and persists them (idempotent)
  private async processRule(rule: ScheduleRule): Promise<void> {
    const dates = this.generateSessionDates(rule.dayOfWeek);
    if (dates.length === 0) return;

    const payloads = this.buildSessionPayloads(rule, dates);
    await this.trainingSessionsRepository.createManyIgnoreDuplicates(payloads);
  }

  // Returns an array of ISO date strings ("YYYY-MM-DD") for the given day of week,
  // starting from tomorrow up to SCHEDULE_HORIZON_DAYS ahead.
  generateSessionDates(dayOfWeek: number, referenceDate: Date = new Date()): string[] {
    const dates: string[] = [];

    // Start from tomorrow to avoid generating sessions for today mid-day
    const start = new Date(referenceDate);
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(referenceDate);
    end.setDate(end.getDate() + SCHEDULE_HORIZON_DAYS);
    end.setHours(23, 59, 59, 999);

    // Advance to the first occurrence of the desired day of week
    const current = new Date(start);
    while (current.getUTCDay() !== dayOfWeek) {
      current.setUTCDate(current.getUTCDate() + 1);
    }

    while (current <= end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setUTCDate(current.getUTCDate() + 7);
    }

    return dates;
  }

  // Maps a rule + date list into the session insert payloads
  buildSessionPayloads(rule: ScheduleRule, dates: string[]): CreateTrainingSessionInput[] {
    return dates.map((date) => ({
      personalId: rule.personalId,
      studentId: rule.studentId,
      scheduleRuleId: rule.id,
      workoutPlanId: rule.workoutPlanId ?? null,
      scheduledDate: date,
      startTime: rule.startTime ?? null,
      endTime: rule.endTime ?? null,
      status: "pending" as const,
      sessionType: rule.sessionType as "presential" | "online" | "rest",
    }));
  }
}
