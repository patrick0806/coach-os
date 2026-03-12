import { Injectable } from "@nestjs/common";

import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { TrainingSession } from "@config/database/schema/schedule";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class TodaySessionService {
  constructor(private trainingSessionsRepository: TrainingSessionsRepository) {}

  async execute(currentUser: IAccessToken): Promise<TrainingSession | null> {
    const studentId = currentUser.profileId;
    return this.trainingSessionsRepository.findTodayByStudent(studentId, currentUser.personalId as string);
  }
}
