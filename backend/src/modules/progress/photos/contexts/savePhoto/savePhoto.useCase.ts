import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ProgressPhotosRepository, ProgressPhoto } from "@shared/repositories/progressPhotos.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { validate } from "@shared/utils/validation.util";

const savePhotoSchema = z.object({
  mediaUrl: z.string().url(),
  notes: z.string().optional(),
});

@Injectable()
export class SaveProgressPhotoUseCase {
  constructor(
    private readonly progressPhotosRepository: ProgressPhotosRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(studentId: string, body: unknown, tenantId: string): Promise<ProgressPhoto> {
    const data = validate(savePhotoSchema, body);

    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.progressPhotosRepository.create({
      tenantId,
      studentId,
      mediaUrl: data.mediaUrl,
      notes: data.notes,
    });
  }
}
