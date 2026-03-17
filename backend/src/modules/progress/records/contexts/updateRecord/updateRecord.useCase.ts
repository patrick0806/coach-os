import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ProgressRecordsRepository, ProgressRecord } from "@shared/repositories/progressRecords.repository";
import { validate } from "@shared/utils/validation.util";

const updateRecordSchema = z.object({
  metricType: z.string().min(1).max(50).optional(),
  value: z.number().positive().optional(),
  unit: z.string().min(1).max(20).optional(),
  recordedAt: z.coerce.date().optional(),
  notes: z.string().nullable().optional(),
});

@Injectable()
export class UpdateProgressRecordUseCase {
  constructor(private readonly progressRecordsRepository: ProgressRecordsRepository) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<ProgressRecord> {
    const data = validate(updateRecordSchema, body);

    const existing = await this.progressRecordsRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Progress record not found");
    }

    const updateData: Parameters<typeof this.progressRecordsRepository.update>[2] = {};

    if (data.metricType !== undefined) updateData.metricType = data.metricType;
    if (data.value !== undefined) updateData.value = data.value.toString();
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.recordedAt !== undefined) updateData.recordedAt = data.recordedAt;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await this.progressRecordsRepository.update(id, tenantId, updateData);
    return updated!;
  }
}
