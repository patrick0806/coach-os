import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { AvailabilityRepository } from "@shared/repositories/availability.repository";
import { ScheduleRulesRepository } from "@shared/repositories/schedule-rules.repository";
import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";

import { AvailableSlotsResponseDTO, TimeSlotDTO } from "./dtos/response.dto";

// Two intervals [a1,a2] and [b1,b2] overlap when: a1 < b2 AND b1 < a2
function overlaps(a1: string, a2: string, b1: string, b2: string): boolean {
  return a1 < b2 && b1 < a2;
}

@Injectable()
export class GetAvailableSlotsService {
  constructor(
    private personalsRepository: PersonalsRepository,
    private availabilityRepository: AvailabilityRepository,
    private scheduleRulesRepository: ScheduleRulesRepository,
    private trainingSessionsRepository: TrainingSessionsRepository,
  ) {}

  async execute(slug: string, date: string): Promise<AvailableSlotsResponseDTO> {
    const personal = await this.personalsRepository.findBySlug(slug);
    if (!personal) {
      throw new NotFoundException("Profissional não encontrado");
    }

    // Determine day of week from the requested date (0=Sunday … 6=Saturday)
    const dayOfWeek = new Date(date + "T00:00:00").getDay();

    // 1. Base: active availability slots for that day
    const allSlots = await this.availabilityRepository.findByDay(personal.id, dayOfWeek);
    const activeSlots = allSlots.filter((s) => s.isActive);

    if (activeSlots.length === 0) {
      return { freeSlots: [], occupiedSlots: [] };
    }

    // 2. Collect occupants: weekly presential rules + specific-date presential sessions
    const presentialRules = await this.scheduleRulesRepository.findActivePresentialByDay(
      personal.id,
      dayOfWeek,
    );

    const allSessions = await this.trainingSessionsRepository.findByPersonalAndDateRange(
      personal.id,
      date,
      date,
    );
    const presentialSessions = allSessions.filter(
      (s) => s.sessionType === "presential" && s.status !== "cancelled",
    );

    // Build a unified list of occupied time ranges
    const occupants: TimeSlotDTO[] = [
      ...presentialRules
        .filter((r) => r.startTime && r.endTime)
        .map((r) => ({ startTime: r.startTime!, endTime: r.endTime! })),
      ...presentialSessions
        .filter((s) => s.startTime && s.endTime)
        .map((s) => ({ startTime: s.startTime!, endTime: s.endTime! })),
    ];

    // 3. Classify each availability slot as free or occupied
    const freeSlots: TimeSlotDTO[] = [];
    const occupiedSlots: TimeSlotDTO[] = [];

    for (const slot of activeSlots) {
      const isBlocked = occupants.some((o) =>
        overlaps(slot.startTime, slot.endTime, o.startTime, o.endTime),
      );
      const entry = { startTime: slot.startTime, endTime: slot.endTime };
      if (isBlocked) {
        occupiedSlots.push(entry);
      } else {
        freeSlots.push(entry);
      }
    }

    return { freeSlots, occupiedSlots };
  }
}
