import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { UpdateBookingStatusService } from "./update-booking-status.service";
import { UpdateBookingStatusDTO } from "./dtos/request.dto";
import { BookingDTO } from "../shared/dtos/booking.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "bookings" })
export class UpdateBookingStatusController {
  constructor(private readonly updateBookingStatusService: UpdateBookingStatusService) {}

  @Patch(":id/status")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update booking status (completed or no-show)" })
  @ApiOkResponse({ type: BookingDTO })
  handle(
    @Param("id") id: string,
    @Body() dto: UpdateBookingStatusDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<BookingDTO> {
    return this.updateBookingStatusService.execute(id, dto.status, user);
  }
}
