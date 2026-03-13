import { Injectable } from "@nestjs/common";
import { format, subDays } from "date-fns";

import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { TrainingSession } from "@config/database/schema/schedule";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class ActivityHistoryService {
  constructor(private trainingSessionsRepository: TrainingSessionsRepository) {}

  async execute(currentUser: IAccessToken, days = 84): Promise<TrainingSession[]> {
    const today = new Date();
    const from = subDays(today, days);

    const fromStr = format(from, "yyyy-MM-dd");
    const toStr = format(today, "yyyy-MM-dd");

    return this.trainingSessionsRepository.findHistoryByStudent(
      currentUser.profileId,
      currentUser.personalId as string,
      fromStr,
      toStr,
    );
  }
}
