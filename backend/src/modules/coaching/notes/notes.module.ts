import { Module } from "@nestjs/common";

import { StudentNotesRepository } from "@shared/repositories/studentNotes.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { CreateNoteController } from "./contexts/createNote/createNote.controller";
import { CreateNoteUseCase } from "./contexts/createNote/createNote.useCase";
import { DeleteNoteController } from "./contexts/deleteNote/deleteNote.controller";
import { DeleteNoteUseCase } from "./contexts/deleteNote/deleteNote.useCase";
import { ListNotesController } from "./contexts/listNotes/listNotes.controller";
import { ListNotesUseCase } from "./contexts/listNotes/listNotes.useCase";
import { UpdateNoteController } from "./contexts/updateNote/updateNote.controller";
import { UpdateNoteUseCase } from "./contexts/updateNote/updateNote.useCase";

@Module({
  controllers: [
    CreateNoteController,
    ListNotesController,
    UpdateNoteController,
    DeleteNoteController,
  ],
  providers: [
    StudentNotesRepository,
    StudentsRepository,
    CreateNoteUseCase,
    ListNotesUseCase,
    UpdateNoteUseCase,
    DeleteNoteUseCase,
  ],
})
export class CoachingNotesModule {}
