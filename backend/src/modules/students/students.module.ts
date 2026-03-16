import { Module } from "@nestjs/common";

import { ResendProvider } from "@shared/providers/resend.provider";
import { CoachStudentRelationsRepository } from "@shared/repositories/coachStudentRelations.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentInvitationTokensRepository } from "@shared/repositories/studentInvitationTokens.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";

import { AcceptInviteController } from "./contexts/acceptInvite/acceptInvite.controller";
import { AcceptInviteUseCase } from "./contexts/acceptInvite/acceptInvite.useCase";
import { CreateStudentController } from "./contexts/createStudent/createStudent.controller";
import { CreateStudentUseCase } from "./contexts/createStudent/createStudent.useCase";
import { GenerateInviteLinkController } from "./contexts/generateInviteLink/generateInviteLink.controller";
import { GenerateInviteLinkUseCase } from "./contexts/generateInviteLink/generateInviteLink.useCase";
import { GetStudentController } from "./contexts/getStudent/getStudent.controller";
import { GetStudentUseCase } from "./contexts/getStudent/getStudent.useCase";
import { InviteStudentController } from "./contexts/inviteStudent/inviteStudent.controller";
import { InviteStudentUseCase } from "./contexts/inviteStudent/inviteStudent.useCase";
import { ListStudentsController } from "./contexts/listStudents/listStudents.controller";
import { ListStudentsUseCase } from "./contexts/listStudents/listStudents.useCase";
import { UpdateStudentController } from "./contexts/updateStudent/updateStudent.controller";
import { UpdateStudentUseCase } from "./contexts/updateStudent/updateStudent.useCase";
import { UpdateStudentStatusController } from "./contexts/updateStudentStatus/updateStudentStatus.controller";
import { UpdateStudentStatusUseCase } from "./contexts/updateStudentStatus/updateStudentStatus.useCase";

@Module({
  controllers: [
    CreateStudentController,
    ListStudentsController,
    GetStudentController,
    UpdateStudentController,
    UpdateStudentStatusController,
    InviteStudentController,
    GenerateInviteLinkController,
    AcceptInviteController,
  ],
  providers: [
    StudentsRepository,
    UsersRepository,
    PersonalsRepository,
    PlansRepository,
    CoachStudentRelationsRepository,
    StudentInvitationTokensRepository,
    ResendProvider,
    CreateStudentUseCase,
    ListStudentsUseCase,
    GetStudentUseCase,
    UpdateStudentUseCase,
    UpdateStudentStatusUseCase,
    InviteStudentUseCase,
    GenerateInviteLinkUseCase,
    AcceptInviteUseCase,
  ],
  exports: [StudentsRepository, CoachStudentRelationsRepository],
})
export class StudentsModule {}
