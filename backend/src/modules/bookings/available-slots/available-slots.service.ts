import { Injectable } from "@nestjs/common";
import { getDay, parseISO } from "date-fns";

import { BookingsRepository, AvailableSlot } from "@shared/repositories/bookings.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class AvailableSlotsService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async execute(date: string, currentUser: IAccessToken): Promise<AvailableSlot[]> {
    // getDay: 0=Sunday, 1=Monday, ..., 6=Saturday
    const dayOfWeek = getDay(parseISO(date));

    return this.bookingsRepository.findAvailableSlots(
      currentUser.personalId as string,
      date,
      dayOfWeek,
    );
  }
}
