import { Injectable } from "@nestjs/common";

import {
  ProgressCheckinsRepository,
  ProgressCheckinWithData,
} from "@shared/repositories/progressCheckins.repository";

interface ListMyCheckinsParams {
  page: number;
  size: number;
}

interface ListMyCheckinsResult {
  content: ProgressCheckinWithData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable()
export class ListMyCheckinsUseCase {
  constructor(
    private readonly progressCheckinsRepository: ProgressCheckinsRepository,
  ) {}

  async execute(
    studentId: string,
    tenantId: string,
    params: ListMyCheckinsParams,
  ): Promise<ListMyCheckinsResult> {
    const { rows, total } =
      await this.progressCheckinsRepository.findAllByStudentId(
        studentId,
        tenantId,
        params,
      );

    return {
      content: rows,
      page: params.page,
      size: params.size,
      totalElements: total,
      totalPages: Math.ceil(total / params.size),
    };
  }
}
