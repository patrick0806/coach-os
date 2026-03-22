import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ProgressRecordsRepository, ProgressRecord } from "@shared/repositories/progressRecords.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { VALID_METRIC_TYPES } from "@shared/enums";
import { validate } from "@shared/utils/validation.util";

const createRecordSchema = z.object({
  metricType: z.enum(VALID_METRIC_TYPES),
  value: z.number().positive(),
  unit: z.string().min(1).max(20),
  recordedAt: z.coerce.date(),
  notes: z.string().optional(),
});

@Injectable()
export class CreateProgressRecordUseCase {
  constructor(
    private readonly progressRecordsRepository: ProgressRecordsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(studentId: string, body: unknown, tenantId: string): Promise<ProgressRecord> {
    const data = validate(createRecordSchema, body);

    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.progressRecordsRepository.create({
      tenantId,
      studentId,
      metricType: data.metricType,
      value: data.value.toString(),
      unit: data.unit,
      recordedAt: data.recordedAt,
      notes: data.notes,
    });
  }
}
