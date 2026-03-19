import { Injectable } from "@nestjs/common";
import { PlansRepository } from "@shared/repositories/plans.repository";

@Injectable()
export class ListPlansUseCase {
  constructor(private readonly plansRepository: PlansRepository) {}

  async execute() {
    return this.plansRepository.findAllAdmin();
  }
}
