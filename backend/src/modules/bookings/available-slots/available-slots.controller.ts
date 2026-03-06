import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { AvailableSlotsService } from "./available-slots.service";
import { AvailableSlotDTO } from "../shared/dtos/booking.dto";

@Roles(ApplicationRoles.STUDENT)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "bookings" })
export class AvailableSlotsController {
  constructor(private readonly availableSlotsService: AvailableSlotsService) {}

  @Get("available-slots")
  @ApiOperation({ summary: "Get available slots for a given date" })
  @ApiQuery({ name: "date", description: "Date in YYYY-MM-DD format", example: "2024-01-15" })
  @ApiOkResponse({ type: [AvailableSlotDTO] })
  handle(
    @Query("date") date: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<AvailableSlotDTO[]> {
    return this.availableSlotsService.execute(date, user);
  }
}
