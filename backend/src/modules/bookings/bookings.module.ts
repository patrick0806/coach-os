import { Module } from "@nestjs/common";

import { BookingsRepository } from "@shared/repositories/bookings.repository";
import { BookingSeriesRepository } from "@shared/repositories/booking-series.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { ResendProvider } from "@shared/providers/resend.provider";

import { AvailableSlotsController } from "./available-slots/available-slots.controller";
import { AvailableSlotsService } from "./available-slots/available-slots.service";
import { CreateBookingController } from "./create-booking/create-booking.controller";
import { CreateBookingService } from "./create-booking/create-booking.service";
import { MyBookingsController } from "./my-bookings/my-bookings.controller";
import { MyBookingsService } from "./my-bookings/my-bookings.service";
import { ListBookingsController } from "./list-bookings/list-bookings.controller";
import { ListBookingsService } from "./list-bookings/list-bookings.service";
import { GetBookingController } from "./get-booking/get-booking.controller";
import { GetBookingService } from "./get-booking/get-booking.service";
import { UpdateBookingStatusController } from "./update-booking-status/update-booking-status.controller";
import { UpdateBookingStatusService } from "./update-booking-status/update-booking-status.service";
import { CancelBookingController } from "./cancel-booking/cancel-booking.controller";
import { CancelBookingService } from "./cancel-booking/cancel-booking.service";
import { CreatePersonalBookingController } from "./create-personal-booking/create-personal-booking.controller";
import { CreatePersonalBookingService } from "./create-personal-booking/create-personal-booking.service";
import { BookingSeriesController } from "./booking-series/booking-series.controller";
import { BookingSeriesService } from "./booking-series/booking-series.service";
import { DeleteBookingScopeController } from "./delete-booking-scope/delete-booking-scope.controller";
import { DeleteBookingScopeService } from "./delete-booking-scope/delete-booking-scope.service";
import { ListBookingSeriesController } from "./list-booking-series/list-booking-series.controller";
import { ListBookingSeriesService } from "./list-booking-series/list-booking-series.service";

@Module({
  controllers: [
    AvailableSlotsController,
    CreateBookingController,
    MyBookingsController,
    ListBookingsController,
    GetBookingController,
    UpdateBookingStatusController,
    CancelBookingController,
    CreatePersonalBookingController,
    BookingSeriesController,
    DeleteBookingScopeController,
    ListBookingSeriesController,
  ],
  providers: [
    AvailableSlotsService,
    CreateBookingService,
    MyBookingsService,
    ListBookingsService,
    GetBookingService,
    UpdateBookingStatusService,
    CancelBookingService,
    CreatePersonalBookingService,
    BookingSeriesService,
    DeleteBookingScopeService,
    ListBookingSeriesService,
    BookingsRepository,
    BookingSeriesRepository,
    ServicePlansRepository,
    StudentsRepository,
    ResendProvider,
  ],
})
export class BookingsModule {}
