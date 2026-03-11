import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { BookingWithRelations, BookingsRepository } from "@shared/repositories/bookings.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class CancelBookingService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async execute(id: string, reason: string, currentUser: IAccessToken): Promise<BookingWithRelations> {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException("O motivo do cancelamento é obrigatório");
    }

    const booking = await this.bookingsRepository.findById(
      id,
      currentUser.personalId as string,
    );
    if (!booking) {
      throw new NotFoundException("Agendamento não encontrado");
    }

    if (booking.status === "cancelled") {
      throw new BadRequestException("Este agendamento já foi cancelado");
    }

    const cancelled = await this.bookingsRepository.cancel(
      id,
      currentUser.personalId as string,
      reason.trim(),
    );

    return cancelled as BookingWithRelations;
  }
}
