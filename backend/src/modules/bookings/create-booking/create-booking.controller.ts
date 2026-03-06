import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CreateBookingService } from "./create-booking.service";
import { CreateBookingDTO } from "./dtos/request.dto";
import { BookingDTO } from "../shared/dtos/booking.dto";

@Roles(ApplicationRoles.STUDENT)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "bookings" })
export class CreateBookingController {
  constructor(private readonly createBookingService: CreateBookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a booking" })
  @ApiCreatedResponse({ type: BookingDTO })
  handle(
    @Body() dto: CreateBookingDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<BookingDTO> {
    return this.createBookingService.execute(dto, user);
  }
}
