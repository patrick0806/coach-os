import { Injectable } from "@nestjs/common";

import { BookingsRepository, AvailableSlot } from "@shared/repositories/bookings.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class AvailableSlotsService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async execute(date: string, currentUser: IAccessToken): Promise<AvailableSlot[]> {
    const parsedDate = new Date(date + "T00:00:00Z");
    // getUTCDay: 0=Sunday, 1=Monday, ..., 6=Saturday
    const dayOfWeek = parsedDate.getUTCDay();

    return this.bookingsRepository.findAvailableSlots(
      currentUser.personalId as string,
      date,
      dayOfWeek,
    );
  }
}
