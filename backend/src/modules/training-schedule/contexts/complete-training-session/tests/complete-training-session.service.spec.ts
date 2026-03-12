import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CompleteTrainingSessionService } from "../complete-training-session.service";

const studentUser = {
  sub: "user-1",
  role: "STUDENT",
  profileId: "student-1",
  personalId: "personal-1",
  personalSlug: "coach",
};

const makeSession = (overrides = {}) => ({
  id: "session-1",
  studentId: "student-1",
  personalId: "personal-1",
  scheduleRuleId: "rule-1",
  workoutPlanId: "wp-1",
  workoutSessionId: null,
  scheduledDate: "2026-03-12",
  scheduledTime: null,
  status: "pending",
  sessionType: "online",
  cancelledAt: null,
  cancellationReason: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("CompleteTrainingSessionService", () => {
  let service: CompleteTrainingSessionService;
  let trainingSessionsRepo: {
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    trainingSessionsRepo = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };
    service = new CompleteTrainingSessionService(trainingSessionsRepo as any);
  });

  it("should throw NotFoundException when session does not exist", async () => {
    trainingSessionsRepo.findById.mockResolvedValue(null);
    await expect(service.execute("session-x", studentUser as any)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when session belongs to a different student", async () => {
    trainingSessionsRepo.findById.mockResolvedValue(makeSession({ studentId: "other-student" }));
    await expect(service.execute("session-1", studentUser as any)).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when session is already completed", async () => {
    trainingSessionsRepo.findById.mockResolvedValue(makeSession({ status: "completed" }));
    await expect(service.execute("session-1", studentUser as any)).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when session is cancelled", async () => {
    trainingSessionsRepo.findById.mockResolvedValue(makeSession({ status: "cancelled" }));
    await expect(service.execute("session-1", studentUser as any)).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when session is a rest day", async () => {
    trainingSessionsRepo.findById.mockResolvedValue(makeSession({ sessionType: "rest" }));
    await expect(service.execute("session-1", studentUser as any)).rejects.toThrow(BadRequestException);
  });

  it("should mark session as completed and return updated record", async () => {
    const session = makeSession();
    const completed = { ...session, status: "completed" };
    trainingSessionsRepo.findById.mockResolvedValue(session);
    trainingSessionsRepo.updateStatus.mockResolvedValue(completed);

    const result = await service.execute("session-1", studentUser as any);

    expect(trainingSessionsRepo.updateStatus).toHaveBeenCalledWith(
      "session-1",
      "completed",
      expect.any(Object),
    );
    expect(result.status).toBe("completed");
  });

  it("should link workoutSessionId when provided", async () => {
    const session = makeSession();
    const completed = { ...session, status: "completed", workoutSessionId: "ws-1" };
    trainingSessionsRepo.findById.mockResolvedValue(session);
    trainingSessionsRepo.updateStatus.mockResolvedValue(completed);

    await service.execute("session-1", studentUser as any, "ws-1");

    expect(trainingSessionsRepo.updateStatus).toHaveBeenCalledWith(
      "session-1",
      "completed",
      expect.objectContaining({ workoutSessionId: "ws-1" }),
    );
  });
});
