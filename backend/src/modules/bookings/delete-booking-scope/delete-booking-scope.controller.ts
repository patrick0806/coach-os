import { Controller, Delete, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";
import { IAccessToken } from "@shared/interfaces";

import { DeleteBookingScopeService } from "./delete-booking-scope.service";
import { DeleteBookingScopeQueryDTO } from "./dtos/request.dto";
import { DeleteBookingScopeResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "bookings" })
export class DeleteBookingScopeController {
  constructor(private readonly deleteBookingScopeService: DeleteBookingScopeService) {}

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel booking with scope single/future/all" })
  @ApiOkResponse({ type: DeleteBookingScopeResponseDTO })
  handle(
    @Param("id") id: string,
    @Query() query: DeleteBookingScopeQueryDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<DeleteBookingScopeResponseDTO> {
    return this.deleteBookingScopeService.execute(id, query, user);
  }
}
