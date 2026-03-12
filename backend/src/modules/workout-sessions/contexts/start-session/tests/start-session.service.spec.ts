import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { StartSessionService } from "../start-session.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.STUDENT,
  profileId: "student-id",
  personalId: "personal-id",
  personalSlug: "john-doe",
};

const PLAN_UUID = "550e8400-e29b-41d4-a716-446655440000";

const mockSession = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  studentId: "student-id",
  workoutPlanId: PLAN_UUID,
  status: "active",
  currentStep: 0,
  startedAt: new Date("2024-01-01"),
  completedAt: null,
};

describe("StartSessionService", () => {
  let service: StartSessionService;
  let workoutSessionsRepository: {
    findActiveByStudentAndPlan: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let workoutPlanStudentsRepository: {
    findAssignment: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    workoutSessionsRepository = {
      findActiveByStudentAndPlan: vi.fn(),
      create: vi.fn(),
    };
    workoutPlanStudentsRepository = {
      findAssignment: vi.fn(),
    };
    service = new StartSessionService(
      workoutSessionsRepository as any,
      workoutPlanStudentsRepository as any,
    );
  });

  describe("execute", () => {
    it("should create a new session when no active session exists", async () => {
      workoutPlanStudentsRepository.findAssignment.mockResolvedValue({ id: "assignment-id" });
      workoutSessionsRepository.findActiveByStudentAndPlan.mockResolvedValue(null);
      workoutSessionsRepository.create.mockResolvedValue(mockSession);

      const result = await service.execute({ workoutPlanId: PLAN_UUID }, mockCurrentUser);

      expect(workoutSessionsRepository.create).toHaveBeenCalledWith({
        studentId: "student-id",
        workoutPlanId: PLAN_UUID,
      });
      expect(result).toEqual(mockSession);
    });

    it("should return existing active session when one exists", async () => {
      const existing = { ...mockSession, currentStep: 2 };
      workoutPlanStudentsRepository.findAssignment.mockResolvedValue({ id: "assignment-id" });
      workoutSessionsRepository.findActiveByStudentAndPlan.mockResolvedValue(existing);

      const result = await service.execute({ workoutPlanId: PLAN_UUID }, mockCurrentUser);

      expect(workoutSessionsRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });

    it("should throw NotFoundException when plan is not assigned to student", async () => {
      workoutPlanStudentsRepository.findAssignment.mockResolvedValue(null);

      await expect(
        service.execute({ workoutPlanId: PLAN_UUID }, mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when workoutPlanId is missing", async () => {
      await expect(
        service.execute({ workoutPlanId: "" }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
