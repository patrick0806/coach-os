import { Injectable } from "@nestjs/common";

import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { TrainingSession } from "@config/database/schema/schedule";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class WeekSessionsService {
  constructor(private trainingSessionsRepository: TrainingSessionsRepository) {}

  async execute(currentUser: IAccessToken): Promise<TrainingSession[]> {
    const studentId = currentUser.profileId;
    return this.trainingSessionsRepository.findWeekByStudent(studentId, currentUser.personalId as string);
  }
}
