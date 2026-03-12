import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CancelTrainingSessionService } from "../cancel-training-session.service";

const personalUser = { sub: "user-1", role: "PERSONAL", profileId: "personal-1", personalId: "personal-1", personalSlug: "coach" };
const studentUser = { sub: "user-2", role: "STUDENT", profileId: "student-1", personalId: "personal-1", personalSlug: "coach" };

const makeSession = (overrides = {}) => ({
  id: "session-1",
  studentId: "student-1",
  personalId: "personal-1",
  scheduleRuleId: "rule-1",
  workoutPlanId: "wp-1",
  workoutSessionId: null,
  scheduledDate: "2026-03-15",
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

describe("CancelTrainingSessionService", () => {
  let service: CancelTrainingSessionService;
  let trainingSessionsRepo: {
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  const studentsRepo = { findById: vi.fn() };
  const resendProvider = { sendSessionCancellation: vi.fn().mockResolvedValue(undefined) };

  beforeEach(() => {
    trainingSessionsRepo = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };
    service = new CancelTrainingSessionService(
      trainingSessionsRepo as any,
      studentsRepo as any,
      resendProvider as any,
    );
  });

  it("should throw NotFoundException when session does not exist", async () => {
    trainingSessionsRepo.findById.mockResolvedValue(null);
    await expect(service.execute("session-x", {}, personalUser as any))
      .rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when session is already completed", async () => {
    trainingSessionsRepo.findById.mockResolvedValue(makeSession({ status: "completed" }));
    await expect(service.execute("session-1", {}, personalUser as any))
      .rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when session is already cancelled", async () => {
    trainingSessionsRepo.findById.mockResolvedValue(makeSession({ status: "cancelled" }));
    await expect(service.execute("session-1", {}, personalUser as any))
      .rejects.toThrow(BadRequestException);
  });

  it("should throw NotFoundException when student tries to cancel a session not belonging to them", async () => {
    trainingSessionsRepo.findById.mockResolvedValue(makeSession({ studentId: "other-student" }));
    await expect(service.execute("session-1", {}, studentUser as any))
      .rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when personal tries to cancel a session not belonging to them", async () => {
    trainingSessionsRepo.findById.mockResolvedValue(makeSession({ personalId: "other-personal" }));
    await expect(service.execute("session-1", {}, personalUser as any))
      .rejects.toThrow(NotFoundException);
  });

  it("should cancel session and return updated record when personal cancels", async () => {
    const session = makeSession();
    const cancelled = { ...session, status: "cancelled", cancelledAt: new Date(), cancellationReason: "Indisponível" };
    trainingSessionsRepo.findById.mockResolvedValue(session);
    trainingSessionsRepo.updateStatus.mockResolvedValue(cancelled);

    const result = await service.execute("session-1", { reason: "Indisponível" }, personalUser as any);

    expect(trainingSessionsRepo.updateStatus).toHaveBeenCalledWith(
      "session-1",
      "cancelled",
      expect.objectContaining({ cancellationReason: "Indisponível" }),
    );
    expect(result.status).toBe("cancelled");
  });

  it("should cancel session without reason when student cancels", async () => {
    const session = makeSession();
    const cancelled = { ...session, status: "cancelled", cancelledAt: new Date() };
    trainingSessionsRepo.findById.mockResolvedValue(session);
    trainingSessionsRepo.updateStatus.mockResolvedValue(cancelled);

    const result = await service.execute("session-1", {}, studentUser as any);

    expect(trainingSessionsRepo.updateStatus).toHaveBeenCalled();
    expect(result.status).toBe("cancelled");
  });
});
