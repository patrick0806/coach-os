import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { BookingSeriesRepository } from "@shared/repositories/booking-series.repository";
import { BookingsRepository } from "@shared/repositories/bookings.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { IAccessToken } from "@shared/interfaces";

import { DeleteBookingScopeInput, DeleteBookingScopeSchema } from "./dtos/request.dto";
import { DeleteBookingScopeResponseDTO } from "./dtos/response.dto";

@Injectable()
export class DeleteBookingScopeService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly bookingSeriesRepository: BookingSeriesRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(
    id: string,
    query: DeleteBookingScopeInput,
    currentUser: IAccessToken,
  ): Promise<DeleteBookingScopeResponseDTO> {
    const parsed = DeleteBookingScopeSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const scope = parsed.data.scope;
    const personalId = currentUser.personalId as string;
    const booking = await this.bookingsRepository.findById(id, personalId);

    if (!booking) {
      throw new NotFoundException("Agendamento não encontrado");
    }

    if (scope === "single") {
      if (booking.status === "completed") {
        throw new BadRequestException("Sessões concluídas não podem ser excluídas");
      }

      if (booking.status === "cancelled") {
        throw new BadRequestException("Este agendamento já foi cancelado");
      }

      await this.bookingsRepository.cancel(
        booking.id,
        personalId,
        "Cancelado pelo personal",
      );

      return {
        scope,
        cancelledBookings: 1,
        seriesCancelled: false,
      };
    }

    if (!booking.seriesId) {
      throw new BadRequestException("Agendamento não pertence a uma série");
    }

    return this.drizzle.db.transaction(async (tx) => {
      const seriesId = booking.seriesId as string;

      const candidates = scope === "future"
        ? await this.bookingsRepository.findFutureBySeries(
            seriesId,
            personalId,
            booking.scheduledDate,
            tx,
          )
        : await this.bookingsRepository.findBySeries(seriesId, personalId, tx);

      const cancelled = await this.bookingsRepository.cancelMany(
        candidates.map((item) => item.id),
        personalId,
        "Cancelado pelo personal",
        tx,
      );

      const remainingOpen = await this.bookingsRepository.countOpenBySeries(
        seriesId,
        personalId,
        tx,
      );

      let seriesCancelled = false;
      if (remainingOpen === 0) {
        await this.bookingSeriesRepository.delete(seriesId, tx);
        seriesCancelled = true;
      }

      return {
        scope,
        cancelledBookings: cancelled.length,
        seriesCancelled,
      };
    });
  }
}
