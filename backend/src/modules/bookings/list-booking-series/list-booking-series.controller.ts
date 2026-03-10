import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";
import { IAccessToken } from "@shared/interfaces";

import { ListBookingSeriesService } from "./list-booking-series.service";
import { BookingSeriesListItemDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "booking-series" })
export class ListBookingSeriesController {
  constructor(private readonly listBookingSeriesService: ListBookingSeriesService) {}

  @Get()
  @ApiOperation({ summary: "List active booking series for the authenticated personal" })
  @ApiOkResponse({ type: [BookingSeriesListItemDTO] })
  handle(@CurrentUser() user: IAccessToken): Promise<BookingSeriesListItemDTO[]> {
    return this.listBookingSeriesService.execute(user);
  }
}
