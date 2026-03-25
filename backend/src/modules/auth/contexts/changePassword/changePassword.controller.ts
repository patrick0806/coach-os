import { Body, Controller, HttpCode, HttpStatus, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser } from "@shared/decorators";
import { IAccessToken } from "@shared/interfaces";

import { ChangePasswordRequestDTO } from "./dtos/request.dto";
import { ChangePasswordResponseDTO } from "./dtos/response.dto";
import { ChangePasswordUseCase } from "./changePassword.useCase";

@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "change-password" })
export class ChangePasswordController {
  constructor(private readonly changePasswordUseCase: ChangePasswordUseCase) { }

  @ApiOperation({ summary: "Change password for the authenticated user" })
  @ApiOkResponse({ type: ChangePasswordResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Patch()
  async handle(
    @CurrentUser() user: IAccessToken,
    @Body() body: ChangePasswordRequestDTO,
  ): Promise<ChangePasswordResponseDTO> {
    await this.changePasswordUseCase.execute({
      userId: user.sub,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    return { message: "Password changed successfully" };
  }
}
