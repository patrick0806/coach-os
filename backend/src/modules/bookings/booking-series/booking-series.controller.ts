import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";
import { IAccessToken } from "@shared/interfaces";

import { BookingSeriesService } from "./booking-series.service";
import { CreateBookingSeriesDTO } from "./dtos/request.dto";
import { CreateBookingSeriesResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "booking-series" })
export class BookingSeriesController {
  constructor(private readonly bookingSeriesService: BookingSeriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create recurring booking series for a student" })
  @ApiCreatedResponse({ type: CreateBookingSeriesResponseDTO })
  handle(
    @Body() dto: CreateBookingSeriesDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<CreateBookingSeriesResponseDTO> {
    return this.bookingSeriesService.execute(dto, user);
  }
}
