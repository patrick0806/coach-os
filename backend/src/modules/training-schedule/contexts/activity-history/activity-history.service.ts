import { Injectable } from "@nestjs/common";

import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { TrainingSession } from "@config/database/schema/schedule";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class ActivityHistoryService {
  constructor(private trainingSessionsRepository: TrainingSessionsRepository) {}

  async execute(currentUser: IAccessToken, days = 84): Promise<TrainingSession[]> {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - days);

    const fromStr = from.toISOString().split("T")[0];
    const toStr = today.toISOString().split("T")[0];

    return this.trainingSessionsRepository.findHistoryByStudent(
      currentUser.profileId,
      fromStr,
      toStr,
    );
  }
}
