import { Controller, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";
import { CurrentUser } from "@shared/decorators/current-user.decorator";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteAccountUseCase } from "./deleteAccount.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.PROFILE)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class DeleteAccountController {
  constructor(private readonly deleteAccountUseCase: DeleteAccountUseCase) {}

  @ApiOperation({ summary: "Delete coach account and all tenant data" })
  @Delete("account")
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@CurrentUser() user: IAccessToken): Promise<void> {
    await this.deleteAccountUseCase.execute(user.personalId!, user.sub);
  }
}
