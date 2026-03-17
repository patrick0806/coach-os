import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { SaveProgressPhotoRequestDTO } from "./dtos/request.dto";
import { SaveProgressPhotoResponseDTO } from "./dtos/response.dto";
import { SaveProgressPhotoUseCase } from "./savePhoto.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/progress-photos" })
export class SaveProgressPhotoController {
  constructor(private readonly saveProgressPhotoUseCase: SaveProgressPhotoUseCase) {}

  @ApiOperation({ summary: "Save progress photo metadata after upload" })
  @ApiCreatedResponse({ type: SaveProgressPhotoResponseDTO })
  @ApiNotFoundResponse({ description: "Student not found" })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Param("studentId") studentId: string,
    @Body() body: SaveProgressPhotoRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.saveProgressPhotoUseCase.execute(studentId, body, user.personalId!);
  }
}
