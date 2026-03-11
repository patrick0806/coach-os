import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { IAccessToken } from "@shared/interfaces";
import { StudentNotesRepository } from "@shared/repositories/student-notes.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { ListStudentNotesInput, ListStudentNotesSchema } from "./dtos/request.dto";
import { PaginatedStudentNotesResponseDTO } from "./dtos/response.dto";

@Injectable()
export class ListStudentNotesService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly studentNotesRepository: StudentNotesRepository,
  ) {}

  async execute(
    studentId: string,
    query: Partial<ListStudentNotesInput>,
    currentUser: IAccessToken,
  ): Promise<PaginatedStudentNotesResponseDTO> {
    const parsed = ListStudentNotesSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const personalId = currentUser.personalId as string;
    const student = await this.studentsRepository.findById(studentId, personalId);

    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    return this.studentNotesRepository.findByStudentId(studentId, personalId, parsed.data);
  }
}
