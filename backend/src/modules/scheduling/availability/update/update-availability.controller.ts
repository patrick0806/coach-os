import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { UpdateAvailabilityService } from "./update-availability.service";
import { UpdateAvailabilityDTO } from "./dtos/request.dto";
import { AvailabilitySlotDTO } from "../shared/dtos/availability-slot.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.AVAILABILITY)
@Controller({ version: "1", path: "" })
export class UpdateAvailabilityController {
  constructor(private readonly updateAvailabilityService: UpdateAvailabilityService) {}

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update an availability slot" })
  @ApiOkResponse({ type: AvailabilitySlotDTO })
  handle(
    @Param("id") id: string,
    @Body() dto: UpdateAvailabilityDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<AvailabilitySlotDTO> {
    return this.updateAvailabilityService.execute(id, dto, user);
  }
}
