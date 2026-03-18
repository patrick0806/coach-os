import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ProgressCheckinsRepository, ProgressCheckinWithData } from "@shared/repositories/progressCheckins.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { validate } from "@shared/utils/validation.util";

const createCheckinSchema = z
  .object({
    checkinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "checkinDate must be YYYY-MM-DD"),
    notes: z.string().optional(),
    records: z
      .array(
        z.object({
          metricType: z.string().min(1).max(50),
          value: z.number().positive(),
          unit: z.string().min(1).max(20),
          notes: z.string().optional(),
        }),
      )
      .default([]),
    photos: z
      .array(
        z.object({
          mediaUrl: z.string().url(),
          notes: z.string().optional(),
        }),
      )
      .default([]),
  })
  .refine((d) => d.records.length > 0 || d.photos.length > 0, {
    message: "At least one record or photo must be provided",
  });

@Injectable()
export class CreateCheckinUseCase {
  constructor(
    private readonly progressCheckinsRepository: ProgressCheckinsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(
    studentId: string,
    body: unknown,
    tenantId: string,
  ): Promise<ProgressCheckinWithData> {
    const data = validate(createCheckinSchema, body);

    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.progressCheckinsRepository.createWithData(
      {
        tenantId,
        studentId,
        checkinDate: data.checkinDate,
        notes: data.notes,
      },
      data.records.map((r) => ({
        metricType: r.metricType,
        value: r.value.toString(),
        unit: r.unit,
        notes: r.notes,
      })),
      data.photos,
    );
  }
}
