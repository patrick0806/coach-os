import { Module } from "@nestjs/common";

import { UsersRepository } from "@shared/repositories/users.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PasswordSetupTokensRepository } from "@shared/repositories/password-setup-tokens.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { ResendProvider } from "@shared/providers/resend.provider";

import { CreateStudentController } from "./contexts/create-student/create-student.controller";
import { CreateStudentService } from "./contexts/create-student/create-student.service";
import { ListStudentsController } from "./contexts/list-students/list-students.controller";
import { ListStudentsService } from "./contexts/list-students/list-students.service";
import { GetStudentController } from "./contexts/get-student/get-student.controller";
import { GetStudentService } from "./contexts/get-student/get-student.service";
import { UpdateStudentController } from "./contexts/update-student/update-student.controller";
import { UpdateStudentService } from "./contexts/update-student/update-student.service";
import { DeactivateStudentController } from "./contexts/deactivate-student/deactivate-student.controller";
import { DeactivateStudentService } from "./contexts/deactivate-student/deactivate-student.service";
import { GetStudentWorkoutPlansController } from "./contexts/get-student-workout-plans/get-student-workout-plans.controller";
import { GetStudentWorkoutPlansService } from "./contexts/get-student-workout-plans/get-student-workout-plans.service";
import { MyWorkoutPlansController } from "./contexts/my-workout-plans/my-workout-plans.controller";
import { MyWorkoutPlansService } from "./contexts/my-workout-plans/my-workout-plans.service";
import { MyWorkoutPlanDetailController } from "./contexts/my-workout-plan-detail/my-workout-plan-detail.controller";
import { MyWorkoutPlanDetailService } from "./contexts/my-workout-plan-detail/my-workout-plan-detail.service";
import { CreateStudentWorkoutPlanController } from "./contexts/create-student-workout-plan/create-student-workout-plan.controller";
import { CreateStudentWorkoutPlanService } from "./contexts/create-student-workout-plan/create-student-workout-plan.service";

@Module({
  controllers: [
    CreateStudentController,
    ListStudentsController,
    GetStudentController,
    UpdateStudentController,
    DeactivateStudentController,
    // US-009 — personal views student plans
    GetStudentWorkoutPlansController,
    CreateStudentWorkoutPlanController,
    // US-010 — student views own plans (static path must come before :id routes)
    MyWorkoutPlansController,
    MyWorkoutPlanDetailController,
  ],
  providers: [
    CreateStudentService,
    ListStudentsService,
    GetStudentService,
    UpdateStudentService,
    DeactivateStudentService,
    GetStudentWorkoutPlansService,
    CreateStudentWorkoutPlanService,
    MyWorkoutPlansService,
    MyWorkoutPlanDetailService,
    UsersRepository,
    StudentsRepository,
    PersonalsRepository,
    PasswordSetupTokensRepository,
    WorkoutPlanStudentsRepository,
    WorkoutPlansRepository,
    ServicePlansRepository,
    ResendProvider,
  ],
})
export class StudentsModule { }
