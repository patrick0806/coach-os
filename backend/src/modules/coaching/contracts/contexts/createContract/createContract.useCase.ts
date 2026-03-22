import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { CoachingContractsRepository, ContractWithPlan } from "@shared/repositories/coachingContracts.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { ServicePlansRepository } from "@shared/repositories/servicePlans.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { validate } from "@shared/utils/validation.util";

const createContractSchema = z.object({
  servicePlanId: z.string().min(1),
});

@Injectable()
export class CreateContractUseCase {
  constructor(
    private readonly contractsRepository: CoachingContractsRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(studentId: string, body: unknown, tenantId: string): Promise<ContractWithPlan> {
    const data = validate(createContractSchema, body);

    // Validate student belongs to tenant
    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    // Validate service plan belongs to tenant and is active
    const servicePlan = await this.servicePlansRepository.findById(data.servicePlanId, tenantId);
    if (!servicePlan) {
      throw new NotFoundException("Service plan not found");
    }
    if (!servicePlan.isActive) {
      throw new NotFoundException("Service plan is not active");
    }

    // Auto-cancel existing active contract + create new one in a transaction
    await this.drizzle.db.transaction(async (tx) => {
      const existingActive = await this.contractsRepository.findActiveByStudentId(studentId, tenantId);
      if (existingActive) {
        await this.contractsRepository.update(existingActive.id, tenantId, {
          status: "cancelled",
          endDate: new Date(),
        }, tx);
      }

      await this.contractsRepository.create({
        tenantId,
        studentId,
        servicePlanId: data.servicePlanId,
        status: "active",
        startDate: new Date(),
      }, tx);
    });

    // Return the contract with servicePlan joined
    const created = await this.contractsRepository.findActiveByStudentId(studentId, tenantId);
    return created!;
  }
}
