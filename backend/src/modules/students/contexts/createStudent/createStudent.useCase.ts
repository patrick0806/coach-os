import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { randomBytes } from "crypto";
import { z } from "zod";

import { ApplicationRoles } from "@shared/enums";
import { CoachStudentRelationsRepository } from "@shared/repositories/coachStudentRelations.repository";
import { CoachingContractsRepository } from "@shared/repositories/coachingContracts.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { ServicePlansRepository } from "@shared/repositories/servicePlans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { validate } from "@shared/utils/validation.util";

const createStudentSchema = z.object({
  name: z.string().min(3).max(150),
  email: z.email().max(255),
  phoneNumber: z.string().optional(),
  goal: z.string().max(300).optional(),
  observations: z.string().optional(),
  physicalRestrictions: z.string().optional(),
  servicePlanId: z.string().optional(),
});

export interface CreateStudentResult {
  id: string;
  userId: string;
  tenantId: string;
  status: string;
  phoneNumber: string | null;
  goal: string | null;
  observations: string | null;
  physicalRestrictions: string | null;
  createdAt: Date | null;
  name: string;
  email: string;
}

@Injectable()
export class CreateStudentUseCase {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly coachStudentRelationsRepository: CoachStudentRelationsRepository,
    private readonly coachingContractsRepository: CoachingContractsRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
  ) { }

  async execute(body: unknown, tenantId: string): Promise<CreateStudentResult> {
    const data = validate(createStudentSchema, body);

    // Normalize phone: strip all non-digit characters
    const normalizedPhone = data.phoneNumber
      ? data.phoneNumber.replace(/\D/g, "") || undefined
      : undefined;

    const personal = await this.personalsRepository.findById(tenantId);
    if (!personal) throw new NotFoundException("Personal not found");

    const plan = await this.plansRepository.findById(personal.subscriptionPlanId);
    if (!plan) throw new NotFoundException("Plan not found");

    // Check student limit
    const count = await this.studentsRepository.countByTenantId(tenantId);
    if (count >= plan.maxStudents) {
      throw new ForbiddenException("Student limit reached for your current plan");
    }

    // Check if email is already in use globally
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("Email already registered in the system");
    }

    // Create user with a random password — student cannot login until password is set up
    const randomPassword = randomBytes(32).toString("hex");
    const hashedPassword = await argon2.hash(randomPassword);

    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: ApplicationRoles.STUDENT,
    });

    // Validate service plan if provided
    if (data.servicePlanId) {
      const plan = await this.servicePlansRepository.findById(data.servicePlanId, tenantId);
      if (!plan) throw new NotFoundException("Service plan not found");
      if (!plan.isActive) throw new NotFoundException("Service plan is not active");
    }

    // Create student record
    const student = await this.studentsRepository.create({
      userId: user.id,
      tenantId,
      status: "active",
      phoneNumber: normalizedPhone,
      goal: data.goal,
      observations: data.observations,
      physicalRestrictions: data.physicalRestrictions,
    });

    // Create coach-student relation
    await this.coachStudentRelationsRepository.create({
      tenantId,
      studentId: student.id,
      status: "active",
      startDate: new Date(),
    });

    // Create coaching contract if service plan was provided
    if (data.servicePlanId) {
      await this.coachingContractsRepository.create({
        tenantId,
        studentId: student.id,
        servicePlanId: data.servicePlanId,
        status: "active",
        startDate: new Date(),
      });
    }

    return {
      id: student.id,
      userId: student.userId,
      tenantId: student.tenantId,
      status: student.status,
      phoneNumber: student.phoneNumber ?? null,
      goal: student.goal ?? null,
      observations: student.observations ?? null,
      physicalRestrictions: student.physicalRestrictions ?? null,
      createdAt: student.createdAt,
      name: user.name,
      email: user.email,
    };
  }
}
