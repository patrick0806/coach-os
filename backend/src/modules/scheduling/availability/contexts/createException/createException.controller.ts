import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateAvailabilityExceptionRequestDTO } from "./dtos/request.dto";
import { CreateAvailabilityExceptionResponseDTO } from "./dtos/response.dto";
import { CreateAvailabilityExceptionUseCase } from "./createException.useCase";

@ApiTags(API_TAGS.AVAILABILITY)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "availability-exceptions" })
export class CreateAvailabilityExceptionController {
  constructor(
    private readonly createAvailabilityExceptionUseCase: CreateAvailabilityExceptionUseCase,
  ) {}

  @ApiOperation({ summary: "Create an availability exception" })
  @ApiCreatedResponse({ type: CreateAvailabilityExceptionResponseDTO })
  @ApiBadRequestResponse({ description: "Invalid date or past date" })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: CreateAvailabilityExceptionRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createAvailabilityExceptionUseCase.execute(
      body,
      user.personalId!,
    );
  }
}
