import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { StudentNote, StudentNotesRepository } from "@shared/repositories/studentNotes.repository";
import { validate } from "@shared/utils/validation.util";

const updateNoteSchema = z.object({
  note: z.string().min(1).max(5000),
});

@Injectable()
export class UpdateNoteUseCase {
  constructor(private readonly studentNotesRepository: StudentNotesRepository) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<StudentNote> {
    const data = validate(updateNoteSchema, body);

    const existing = await this.studentNotesRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Note not found");
    }

    const updated = await this.studentNotesRepository.update(id, tenantId, data.note);
    return updated!;
  }
}
