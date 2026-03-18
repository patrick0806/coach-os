import { Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CancelContractUseCase } from "./cancelContract.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "coaching-contracts" })
export class CancelContractController {
  constructor(private readonly cancelContractUseCase: CancelContractUseCase) {}

  @ApiOperation({ summary: "Cancel a coaching contract" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Patch(":id/cancel")
  async handle(@Param("id") id: string, @CurrentUser() user: IAccessToken) {
    return this.cancelContractUseCase.execute(id, user.personalId!);
  }
}
