import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListContractsResponseDTO } from "./dtos/response.dto";
import { ListContractsUseCase } from "./listContracts.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/contracts" })
export class ListContractsController {
  constructor(private readonly listContractsUseCase: ListContractsUseCase) {}

  @ApiOperation({ summary: "List all contracts for a student" })
  @ApiOkResponse({ type: [ListContractsResponseDTO] })
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Param("studentId") studentId: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.listContractsUseCase.execute(studentId, user.personalId!);
  }
}
