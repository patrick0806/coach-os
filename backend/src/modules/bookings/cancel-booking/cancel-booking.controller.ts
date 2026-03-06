import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CancelBookingService } from "./cancel-booking.service";
import { CancelBookingDTO } from "./dtos/request.dto";
import { BookingDTO } from "../shared/dtos/booking.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "bookings" })
export class CancelBookingController {
  constructor(private readonly cancelBookingService: CancelBookingService) {}

  @Patch(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel a booking" })
  @ApiOkResponse({ type: BookingDTO })
  handle(
    @Param("id") id: string,
    @Body() dto: CancelBookingDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<BookingDTO> {
    return this.cancelBookingService.execute(id, dto.reason, user);
  }
}
