import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";

import { CurrentUser } from "@shared/decorators/current-user.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";
import { IAccessToken } from "@shared/interfaces";

import { CreateStudentWorkoutPlanService } from "./create-student-workout-plan.service";
import { CreateStudentWorkoutPlanInput } from "./dtos/request.dto";

@Controller("students")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ApplicationRoles.PERSONAL)
export class CreateStudentWorkoutPlanController {
    constructor(private readonly service: CreateStudentWorkoutPlanService) { }

    @Post(":studentId/workout-plans")
    async handle(
        @Param("studentId") studentId: string,
        @Body() body: CreateStudentWorkoutPlanInput,
        @CurrentUser() user: IAccessToken,
    ) {
        return this.service.execute(studentId, body, user);
    }
}
