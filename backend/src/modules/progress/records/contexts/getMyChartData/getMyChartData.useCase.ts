import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { ProgressRecordsRepository } from "@shared/repositories/progressRecords.repository";
import { VALID_METRIC_TYPES } from "@shared/enums";
import { validate } from "@shared/utils/validation.util";

const getMyChartDataSchema = z.object({
  metricType: z.enum(VALID_METRIC_TYPES).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

@Injectable()
export class GetMyChartDataUseCase {
  constructor(
    private readonly progressRecordsRepository: ProgressRecordsRepository,
  ) {}

  async execute(
    studentId: string,
    tenantId: string,
    query: unknown,
  ): Promise<{ data: Array<{ recordedAt: Date; value: string; unit: string; metricType: string }> }> {
    const params = validate(getMyChartDataSchema, query);

    const data = await this.progressRecordsRepository.findAllForChart(
      studentId,
      tenantId,
      params.metricType,
      { startDate: params.startDate, endDate: params.endDate },
    );

    return { data };
  }
}
