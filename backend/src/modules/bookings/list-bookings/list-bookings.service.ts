import { Injectable } from "@nestjs/common";

import { BookingsRepository, PaginatedBookings } from "@shared/repositories/bookings.repository";
import { IAccessToken } from "@shared/interfaces";

interface ListBookingsOptions {
  page?: number;
  size?: number;
  status?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class ListBookingsService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async execute(options: ListBookingsOptions, currentUser: IAccessToken): Promise<PaginatedBookings> {
    const { page = 1, size = 10, status, from, to } = options;

    const paginated = await this.bookingsRepository.findByPersonal(currentUser.personalId as string, {
      page,
      size,
      status,
      from: from ? new Date(from + "T00:00:00Z") : undefined,
      to: to ? new Date(to + "T23:59:59Z") : undefined,
    });

    return {
      ...paginated,
      content: paginated.content.map((booking) => ({
        ...booking,
        isRecurring: Boolean(booking.seriesId),
      })),
    };
  }
}
