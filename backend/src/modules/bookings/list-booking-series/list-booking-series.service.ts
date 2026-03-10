import { Injectable } from "@nestjs/common";

import { BookingSeriesRepository } from "@shared/repositories/booking-series.repository";
import { IAccessToken } from "@shared/interfaces";

import { BookingSeriesListItemDTO } from "./dtos/response.dto";

@Injectable()
export class ListBookingSeriesService {
  constructor(private readonly bookingSeriesRepository: BookingSeriesRepository) {}

  async execute(currentUser: IAccessToken): Promise<BookingSeriesListItemDTO[]> {
    return this.bookingSeriesRepository.findActiveByPersonal(currentUser.personalId as string);
  }
}
