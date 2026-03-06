import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { GetBookingService } from "./get-booking.service";
import { BookingDTO } from "../shared/dtos/booking.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "bookings" })
export class GetBookingController {
  constructor(private readonly getBookingService: GetBookingService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get booking detail" })
  @ApiOkResponse({ type: BookingDTO })
  handle(@Param("id") id: string, @CurrentUser() user: IAccessToken): Promise<BookingDTO> {
    return this.getBookingService.execute(id, user);
  }
}
