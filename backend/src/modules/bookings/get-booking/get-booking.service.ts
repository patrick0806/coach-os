import { Injectable, NotFoundException } from "@nestjs/common";

import { BookingsRepository } from "@shared/repositories/bookings.repository";
import { IAccessToken } from "@shared/interfaces";
import { Booking } from "@config/database/schema/availability";

@Injectable()
export class GetBookingService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async execute(id: string, currentUser: IAccessToken): Promise<Booking> {
    const booking = await this.bookingsRepository.findById(
      id,
      currentUser.personalId as string,
    );
    if (!booking) {
      throw new NotFoundException("Agendamento não encontrado");
    }
    return booking;
  }
}
