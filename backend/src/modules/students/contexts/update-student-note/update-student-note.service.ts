import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { IAccessToken } from "@shared/interfaces";
import { StudentNotesRepository } from "@shared/repositories/student-notes.repository";

import { UpdateStudentNoteInput, UpdateStudentNoteSchema } from "./dtos/request.dto";
import { StudentNoteResponseDTO } from "../create-student-note/dtos/response.dto";

@Injectable()
export class UpdateStudentNoteService {
  constructor(private readonly studentNotesRepository: StudentNotesRepository) {}

  async execute(
    noteId: string,
    dto: UpdateStudentNoteInput,
    currentUser: IAccessToken,
  ): Promise<StudentNoteResponseDTO> {
    const parsed = UpdateStudentNoteSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const note = await this.studentNotesRepository.findById(noteId);
    if (!note) {
      throw new NotFoundException("Nota não encontrada");
    }

    if (note.personalId !== currentUser.personalId) {
      throw new ForbiddenException("Você não pode editar esta nota");
    }

    const updated = await this.studentNotesRepository.update(noteId, parsed.data.note);
    if (!updated) {
      throw new NotFoundException("Nota não encontrada");
    }

    return updated;
  }
}
