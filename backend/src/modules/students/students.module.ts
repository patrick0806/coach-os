import { Module } from "@nestjs/common";

import { UsersRepository } from "@shared/repositories/users.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PasswordSetupTokensRepository } from "@shared/repositories/password-setup-tokens.repository";
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

@Module({
  controllers: [
    CreateStudentController,
    ListStudentsController,
    GetStudentController,
    UpdateStudentController,
    DeactivateStudentController,
  ],
  providers: [
    CreateStudentService,
    ListStudentsService,
    GetStudentService,
    UpdateStudentService,
    DeactivateStudentService,
    UsersRepository,
    StudentsRepository,
    PersonalsRepository,
    PasswordSetupTokensRepository,
    ResendProvider,
  ],
})
export class StudentsModule {}
