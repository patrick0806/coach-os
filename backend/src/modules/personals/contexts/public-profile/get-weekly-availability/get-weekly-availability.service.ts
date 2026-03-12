import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { AvailabilityRepository } from "@shared/repositories/availability.repository";
import { ScheduleRulesRepository } from "@shared/repositories/schedule-rules.repository";

import { WeeklyAvailabilityResponseDTO, DayAvailabilityDTO, TimeSlotDTO } from "./dtos/response.dto";

// Two intervals [a1,a2] and [b1,b2] overlap when: a1 < b2 AND b1 < a2
function overlaps(a1: string, a2: string, b1: string, b2: string): boolean {
    return a1 < b2 && b1 < a2;
}

@Injectable()
export class GetWeeklyAvailabilityService {
    constructor(
        private personalsRepository: PersonalsRepository,
        private availabilityRepository: AvailabilityRepository,
        private scheduleRulesRepository: ScheduleRulesRepository,
    ) { }

    async execute(slug: string): Promise<WeeklyAvailabilityResponseDTO> {
        const personal = await this.personalsRepository.findBySlug(slug);
        if (!personal) {
            throw new NotFoundException("Profissional não encontrado");
        }

        // 1. Get all active availability slots
        const allSlots = await this.availabilityRepository.findByPersonalId(personal.id);
        const activeSlots = allSlots.filter((s) => s.isActive);

        const days: DayAvailabilityDTO[] = [];

        // 2. We could fetch all rules at once, but we can also fetch them per day 0..6
        // Since we also want days without slots to return an empty array, we will loop 0 to 6
        for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
            const daySlots = activeSlots.filter(s => s.dayOfWeek === dayOfWeek);

            if (daySlots.length === 0) {
                days.push({ dayOfWeek, freeSlots: [], occupiedSlots: [] });
                continue;
            }

            // Collect occupants: weekly presential rules
            const presentialRules = await this.scheduleRulesRepository.findActivePresentialByDay(
                personal.id,
                dayOfWeek,
            );

            const occupants: TimeSlotDTO[] = presentialRules
                .filter((r) => r.startTime && r.endTime)
                .map((r) => ({ startTime: r.startTime!, endTime: r.endTime! }));

            const freeSlots: TimeSlotDTO[] = [];
            const occupiedSlots: TimeSlotDTO[] = [];

            for (const slot of daySlots) {
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

            days.push({ dayOfWeek, freeSlots, occupiedSlots });
        }

        return { days };
    }
}
