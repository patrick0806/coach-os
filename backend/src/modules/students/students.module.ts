import { Module } from "@nestjs/common";

import { UsersRepository } from "@shared/repositories/users.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PasswordSetupTokensRepository } from "@shared/repositories/password-setup-tokens.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { BookingsRepository } from "@shared/repositories/bookings.repository";
import { StudentNotesRepository } from "@shared/repositories/student-notes.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentStatsRepository } from "@shared/repositories/student-stats.repository";
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
import { GetStudentBookingsController } from "./contexts/get-student-bookings/get-student-bookings.controller";
import { GetStudentBookingsService } from "./contexts/get-student-bookings/get-student-bookings.service";
import { MyWorkoutPlansController } from "./contexts/my-workout-plans/my-workout-plans.controller";
import { MyWorkoutPlansService } from "./contexts/my-workout-plans/my-workout-plans.service";
import { MyWorkoutPlanDetailController } from "./contexts/my-workout-plan-detail/my-workout-plan-detail.controller";
import { MyWorkoutPlanDetailService } from "./contexts/my-workout-plan-detail/my-workout-plan-detail.service";
import { MyStatsController } from "./contexts/my-stats/my-stats.controller";
import { MyStatsService } from "./contexts/my-stats/my-stats.service";
import { CreateStudentNoteController } from "./contexts/create-student-note/create-student-note.controller";
import { CreateStudentNoteService } from "./contexts/create-student-note/create-student-note.service";
import { ListStudentNotesController } from "./contexts/list-student-notes/list-student-notes.controller";
import { ListStudentNotesService } from "./contexts/list-student-notes/list-student-notes.service";
import { UpdateStudentNoteController } from "./contexts/update-student-note/update-student-note.controller";
import { UpdateStudentNoteService } from "./contexts/update-student-note/update-student-note.service";
import { DeleteStudentNoteController } from "./contexts/delete-student-note/delete-student-note.controller";
import { DeleteStudentNoteService } from "./contexts/delete-student-note/delete-student-note.service";

@Module({
  controllers: [
    CreateStudentController,
    ListStudentsController,
    GetStudentController,
    UpdateStudentController,
    DeactivateStudentController,
    // US-009 — personal views student plans
    GetStudentWorkoutPlansController,
    GetStudentBookingsController,
    CreateStudentNoteController,
    ListStudentNotesController,
    UpdateStudentNoteController,
    DeleteStudentNoteController,
    // US-010 — student views own plans (static path must come before :id routes)
    MyWorkoutPlansController,
    MyWorkoutPlanDetailController,
    MyStatsController,
  ],
  providers: [
    CreateStudentService,
    ListStudentsService,
    GetStudentService,
    UpdateStudentService,
    DeactivateStudentService,
    GetStudentWorkoutPlansService,
    GetStudentBookingsService,
    CreateStudentNoteService,
    ListStudentNotesService,
    UpdateStudentNoteService,
    DeleteStudentNoteService,
    MyWorkoutPlansService,
    MyWorkoutPlanDetailService,
    MyStatsService,
    UsersRepository,
    StudentsRepository,
    PersonalsRepository,
    PasswordSetupTokensRepository,
    WorkoutPlanStudentsRepository,
    WorkoutPlansRepository,
    BookingsRepository,
    StudentNotesRepository,
    ServicePlansRepository,
    PlansRepository,
    StudentStatsRepository,
    ResendProvider,
  ],
})
export class StudentsModule { }
