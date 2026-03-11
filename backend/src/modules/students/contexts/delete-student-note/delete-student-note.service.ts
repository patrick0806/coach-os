import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { IAccessToken } from "@shared/interfaces";
import { StudentNotesRepository } from "@shared/repositories/student-notes.repository";

@Injectable()
export class DeleteStudentNoteService {
  constructor(private readonly studentNotesRepository: StudentNotesRepository) {}

  async execute(noteId: string, currentUser: IAccessToken): Promise<void> {
    const note = await this.studentNotesRepository.findById(noteId);
    if (!note) {
      throw new NotFoundException("Nota não encontrada");
    }

    if (note.personalId !== currentUser.personalId) {
      throw new ForbiddenException("Você não pode deletar esta nota");
    }

    await this.studentNotesRepository.delete(noteId);
  }
}
