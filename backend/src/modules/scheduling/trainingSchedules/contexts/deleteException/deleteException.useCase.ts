import { Injectable, NotFoundException } from "@nestjs/common";

import { TrainingScheduleExceptionsRepository } from "@shared/repositories/trainingScheduleExceptions.repository";

@Injectable()
export class DeleteExceptionUseCase {
  constructor(
    private readonly exceptionsRepository: TrainingScheduleExceptionsRepository,
  ) {}

  async execute(exceptionId: string, tenantId: string): Promise<void> {
    const exception = await this.exceptionsRepository.findById(exceptionId, tenantId);
    if (!exception) {
      throw new NotFoundException("Training schedule exception not found");
    }

    await this.exceptionsRepository.delete(exceptionId, tenantId);
  }
}
