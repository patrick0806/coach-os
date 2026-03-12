import { Injectable } from "@nestjs/common";

import { TrainingSessionsRepository, TrainingSessionWithStudent } from "@shared/repositories/training-sessions.repository";
import { IAccessToken } from "@shared/interfaces";

import { PersonalCalendarQuery } from "./dtos/request.dto";

@Injectable()
export class PersonalCalendarService {
  constructor(private trainingSessionsRepository: TrainingSessionsRepository) {}

  async execute(
    query: PersonalCalendarQuery,
    currentUser: IAccessToken,
  ): Promise<TrainingSessionWithStudent[]> {
    const personalId = currentUser.personalId as string;
    return this.trainingSessionsRepository.findByPersonalAndDateRange(
      personalId,
      query.from,
      query.to,
    );
  }
}
