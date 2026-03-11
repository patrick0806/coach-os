import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { IAccessToken } from "@shared/interfaces";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { StudentNotesRepository } from "@shared/repositories/student-notes.repository";

import { CreateStudentNoteInput, CreateStudentNoteSchema } from "./dtos/request.dto";
import { StudentNoteResponseDTO } from "./dtos/response.dto";

@Injectable()
export class CreateStudentNoteService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly studentNotesRepository: StudentNotesRepository,
  ) {}

  async execute(
    studentId: string,
    dto: CreateStudentNoteInput,
    currentUser: IAccessToken,
  ): Promise<StudentNoteResponseDTO> {
    const parsed = CreateStudentNoteSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const personalId = currentUser.personalId as string;
    const student = await this.studentsRepository.findById(studentId, personalId);

    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    return this.studentNotesRepository.create({
      studentId,
      personalId,
      note: parsed.data.note,
    });
  }
}
