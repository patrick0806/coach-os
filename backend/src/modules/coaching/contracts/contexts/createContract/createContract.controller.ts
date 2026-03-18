import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateContractRequestDTO } from "./dtos/request.dto";
import { CreateContractResponseDTO } from "./dtos/response.dto";
import { CreateContractUseCase } from "./createContract.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/contracts" })
export class CreateContractController {
  constructor(private readonly createContractUseCase: CreateContractUseCase) {}

  @ApiOperation({ summary: "Create or replace a coaching contract for a student" })
  @ApiCreatedResponse({ type: CreateContractResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Param("studentId") studentId: string,
    @Body() body: CreateContractRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createContractUseCase.execute(studentId, body, user.personalId!);
  }
}
