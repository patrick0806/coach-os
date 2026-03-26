import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository, Plan } from "@shared/repositories/plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import type { Personal } from "@config/database/schema/personals";

/**
 * Validates that the tenant has not exceeded their student limit.
 * Returns the personal and plan records for downstream use.
 *
 * Skips the check for whitelisted accounts.
 */
export async function enforceStudentLimit(
  tenantId: string,
  personalsRepository: PersonalsRepository,
  plansRepository: PlansRepository,
  studentsRepository: StudentsRepository,
): Promise<{ personal: Personal; plan: Plan }> {
  const personal = await personalsRepository.findById(tenantId);
  if (!personal) throw new NotFoundException("Personal not found");

  const plan = await plansRepository.findById(personal.subscriptionPlanId);
  if (!plan) throw new NotFoundException("Plano não encontrado");

  if (!personal.isWhitelisted) {
    const count = await studentsRepository.countByTenantId(tenantId);
    if (count >= plan.maxStudents) {
      throw new ForbiddenException("Student limit reached for your current plan");
    }
  }

  return { personal, plan };
}
