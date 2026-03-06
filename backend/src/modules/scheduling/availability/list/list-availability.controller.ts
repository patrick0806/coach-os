import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { ListAvailabilityService } from "./list-availability.service";
import { AvailabilitySlotDTO } from "../shared/dtos/availability-slot.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.AVAILABILITY)
@Controller({ version: "1", path: "" })
export class ListAvailabilityController {
  constructor(private readonly listAvailabilityService: ListAvailabilityService) {}

  @Get()
  @ApiOperation({ summary: "List availability slots for the authenticated personal" })
  @ApiOkResponse({ type: [AvailabilitySlotDTO] })
  handle(@CurrentUser() user: IAccessToken): Promise<AvailabilitySlotDTO[]> {
    return this.listAvailabilityService.execute(user);
  }
}
