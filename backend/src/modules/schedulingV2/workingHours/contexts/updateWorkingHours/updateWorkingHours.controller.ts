import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateWorkingHoursRequestDTO } from "./dtos/request.dto";
import { UpdateWorkingHoursResponseDTO } from "./dtos/response.dto";
import { UpdateWorkingHoursUseCase } from "./updateWorkingHours.useCase";

@ApiTags("Working Hours")
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "working-hours" })
export class UpdateWorkingHoursController {
  constructor(
    private readonly updateWorkingHoursUseCase: UpdateWorkingHoursUseCase,
  ) {}

  @ApiOperation({ summary: "Update working hours (versioned)" })
  @ApiOkResponse({ type: UpdateWorkingHoursResponseDTO })
  @ApiNotFoundResponse({ description: "Working hours not found" })
  @HttpCode(HttpStatus.OK)
  @Patch(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateWorkingHoursRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateWorkingHoursUseCase.execute(id, body, user.personalId!);
  }
}
