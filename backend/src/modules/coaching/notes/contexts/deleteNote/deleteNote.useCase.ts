import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentNotesRepository } from "@shared/repositories/studentNotes.repository";

@Injectable()
export class DeleteNoteUseCase {
  constructor(private readonly studentNotesRepository: StudentNotesRepository) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.studentNotesRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Note not found");
    }

    await this.studentNotesRepository.delete(id, tenantId);
  }
}
