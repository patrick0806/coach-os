import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CreatePersonalBookingService } from "./create-personal-booking.service";
import { CreatePersonalBookingDTO } from "./dtos/request.dto";
import { BookingDTO } from "../shared/dtos/booking.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "bookings" })
export class CreatePersonalBookingController {
  constructor(private readonly createPersonalBookingService: CreatePersonalBookingService) {}

  @Post("personal")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a booking as personal (single session)" })
  @ApiCreatedResponse({ type: BookingDTO })
  handle(
    @Body() dto: CreatePersonalBookingDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<BookingDTO> {
    return this.createPersonalBookingService.execute(dto, user);
  }
}
