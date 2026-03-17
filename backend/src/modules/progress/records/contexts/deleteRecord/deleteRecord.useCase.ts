import { Injectable, NotFoundException } from "@nestjs/common";

import { ProgressRecordsRepository } from "@shared/repositories/progressRecords.repository";

@Injectable()
export class DeleteProgressRecordUseCase {
  constructor(private readonly progressRecordsRepository: ProgressRecordsRepository) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.progressRecordsRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Progress record not found");
    }

    await this.progressRecordsRepository.delete(id, tenantId);
  }
}
