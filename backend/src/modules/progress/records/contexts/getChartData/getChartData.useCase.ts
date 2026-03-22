import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ProgressRecordsRepository } from "@shared/repositories/progressRecords.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { VALID_METRIC_TYPES } from "@shared/enums";
import { validate } from "@shared/utils/validation.util";

const getChartDataSchema = z.object({
  metricType: z.enum(VALID_METRIC_TYPES).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

@Injectable()
export class GetChartDataUseCase {
  constructor(
    private readonly progressRecordsRepository: ProgressRecordsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(
    studentId: string,
    query: unknown,
    tenantId: string,
  ): Promise<{ data: Array<{ recordedAt: Date; value: string; unit: string; metricType: string }> }> {
    const params = validate(getChartDataSchema, query);

    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const data = await this.progressRecordsRepository.findAllForChart(
      studentId,
      tenantId,
      params.metricType,
      { startDate: params.startDate, endDate: params.endDate },
    );

    return { data };
  }
}
