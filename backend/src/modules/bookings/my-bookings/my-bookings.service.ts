import { Injectable } from "@nestjs/common";

import { BookingsRepository, PaginatedBookings } from "@shared/repositories/bookings.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class MyBookingsService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async execute(
    options: { page: number; size: number },
    currentUser: IAccessToken,
  ): Promise<PaginatedBookings> {
    const studentId = currentUser.profileId as string;
    const personalId = currentUser.personalId as string;

    return this.bookingsRepository.findByStudent(studentId, personalId, options);
  }
}
