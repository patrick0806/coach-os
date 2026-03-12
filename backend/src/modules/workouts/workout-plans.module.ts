import { Module } from "@nestjs/common";

import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { WorkoutExercisesRepository } from "@shared/repositories/workout-exercises.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { CreateWorkoutPlanController } from "./workout-plans/create/create-workout-plan.controller";
import { CreateWorkoutPlanService } from "./workout-plans/create/create-workout-plan.service";
import { ListWorkoutPlansController } from "./workout-plans/list/list-workout-plans.controller";
import { ListWorkoutPlansService } from "./workout-plans/list/list-workout-plans.service";
import { GetWorkoutPlanController } from "./workout-plans/get/get-workout-plan.controller";
import { GetWorkoutPlanService } from "./workout-plans/get/get-workout-plan.service";
import { UpdateWorkoutPlanController } from "./workout-plans/update/update-workout-plan.controller";
import { UpdateWorkoutPlanService } from "./workout-plans/update/update-workout-plan.service";
import { DeleteWorkoutPlanController } from "./workout-plans/delete/delete-workout-plan.controller";
import { DeleteWorkoutPlanService } from "./workout-plans/delete/delete-workout-plan.service";
import { AddExerciseController } from "./workout-plans/add-exercise/add-exercise.controller";
import { AddExerciseService } from "./workout-plans/add-exercise/add-exercise.service";
import { RemoveExerciseController } from "./workout-plans/remove-exercise/remove-exercise.controller";
import { RemoveExerciseService } from "./workout-plans/remove-exercise/remove-exercise.service";
import { ReorderExercisesController } from "./workout-plans/reorder-exercises/reorder-exercises.controller";
import { ReorderExercisesService } from "./workout-plans/reorder-exercises/reorder-exercises.service";
import { AssignStudentsController } from "./workout-plans/assign-students/assign-students.controller";
import { AssignStudentsService } from "./workout-plans/assign-students/assign-students.service";
import { RevokeStudentController } from "./workout-plans/revoke-student/revoke-student.controller";
import { RevokeStudentService } from "./workout-plans/revoke-student/revoke-student.service";
import { ApplyTemplateController } from "./workout-plans/apply-template/apply-template.controller";
import { ApplyTemplateService } from "./workout-plans/apply-template/apply-template.service";
import { CreateStudentPlanController } from "./workout-plans/create-student-plan/create-student-plan.controller";
import { CreateStudentPlanService } from "./workout-plans/create-student-plan/create-student-plan.service";

@Module({
  controllers: [
    CreateWorkoutPlanController,
    ListWorkoutPlansController,
    GetWorkoutPlanController,
    UpdateWorkoutPlanController,
    DeleteWorkoutPlanController,
    AddExerciseController,
    RemoveExerciseController,
    ReorderExercisesController,
    AssignStudentsController,
    RevokeStudentController,
    ApplyTemplateController,
    CreateStudentPlanController,
  ],
  providers: [
    CreateWorkoutPlanService,
    ListWorkoutPlansService,
    GetWorkoutPlanService,
    UpdateWorkoutPlanService,
    DeleteWorkoutPlanService,
    AddExerciseService,
    RemoveExerciseService,
    ReorderExercisesService,
    AssignStudentsService,
    RevokeStudentService,
    ApplyTemplateService,
    CreateStudentPlanService,
    WorkoutPlansRepository,
    WorkoutExercisesRepository,
    WorkoutPlanStudentsRepository,
    StudentsRepository,
  ],
})
export class WorkoutPlansModule {}
