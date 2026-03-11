import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { ListBookingsService } from "./list-bookings.service";
import { PaginatedBookingsDTO } from "../shared/dtos/booking.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "bookings" })
export class ListBookingsController {
  constructor(private readonly listBookingsService: ListBookingsService) {}

  @Get()
  @ApiOperation({ summary: "List bookings for the authenticated personal" })
  @ApiQuery({ name: "status", required: false, example: "scheduled" })
  @ApiQuery({ name: "from", required: false, example: "2026-03-01" })
  @ApiQuery({ name: "to", required: false, example: "2026-03-31" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "size", required: false, example: 10 })
  @ApiOkResponse({ type: PaginatedBookingsDTO })
  handle(
    @Query("status") status?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("page") page = "1",
    @Query("size") size = "10",
    @CurrentUser() user?: IAccessToken,
  ): Promise<PaginatedBookingsDTO> {
    return this.listBookingsService.execute(
      { status, from, to, page: Number(page), size: Number(size) },
      user!,
    );
  }
}
