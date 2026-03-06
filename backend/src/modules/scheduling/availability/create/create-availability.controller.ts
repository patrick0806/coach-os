import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CreateAvailabilityService } from "./create-availability.service";
import { CreateAvailabilityDTO } from "./dtos/request.dto";
import { AvailabilitySlotDTO } from "../shared/dtos/availability-slot.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.AVAILABILITY)
@Controller({ version: "1", path: "" })
export class CreateAvailabilityController {
  constructor(private readonly createAvailabilityService: CreateAvailabilityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new availability slot" })
  @ApiCreatedResponse({ type: AvailabilitySlotDTO })
  handle(
    @Body() dto: CreateAvailabilityDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<AvailabilitySlotDTO> {
    return this.createAvailabilityService.execute(dto, user);
  }
}
