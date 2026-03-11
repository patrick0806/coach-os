import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { BookingWithRelations, BookingsRepository } from "@shared/repositories/bookings.repository";
import { IAccessToken } from "@shared/interfaces";

const ALLOWED_STATUSES = ["completed", "no-show"] as const;

@Injectable()
export class UpdateBookingStatusService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async execute(id: string, status: string, currentUser: IAccessToken): Promise<BookingWithRelations> {
    if (!ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
      throw new BadRequestException(
        `Status inválido. Valores permitidos: ${ALLOWED_STATUSES.join(", ")}`,
      );
    }

    const booking = await this.bookingsRepository.findById(
      id,
      currentUser.personalId as string,
    );
    if (!booking) {
      throw new NotFoundException("Agendamento não encontrado");
    }

    if (booking.status === "cancelled") {
      throw new BadRequestException("Não é possível alterar o status de um agendamento cancelado");
    }

    const updated = await this.bookingsRepository.updateStatus(
      id,
      currentUser.personalId as string,
      status,
    );

    return updated as BookingWithRelations;
  }
}
