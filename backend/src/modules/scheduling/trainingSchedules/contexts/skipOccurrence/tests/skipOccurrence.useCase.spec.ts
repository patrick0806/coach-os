import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";

import { SkipOccurrenceUseCase } from "../skipOccurrence.useCase";

const TENANT_ID = "tenant-001";
const SCHEDULE_ID = "schedule-001";

const makeSchedule = (overrides = {}) => ({
  id: SCHEDULE_ID,
  tenantId: TENANT_ID,
  studentId: "student-001",
  dayOfWeek: 1, // Monday
  startTime: "09:00",
  endTime: "10:00",
  isActive: true,
  ...overrides,
});

const makeTrainingSchedulesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeSchedule()),
});

const makeExceptionsRepository = () => ({
  findByScheduleAndOriginalDate: vi.fn().mockResolvedValue(undefined),
  create: vi.fn().mockImplementation((data) => Promise.resolve({ id: "exc-001", ...data })),
});

describe("SkipOccurrenceUseCase", () => {
  let useCase: SkipOccurrenceUseCase;
  let trainingSchedulesRepository: ReturnType<typeof makeTrainingSchedulesRepository>;
  let exceptionsRepository: ReturnType<typeof makeExceptionsRepository>;

  beforeEach(() => {
    trainingSchedulesRepository = makeTrainingSchedulesRepository();
    exceptionsRepository = makeExceptionsRepository();
    useCase = new SkipOccurrenceUseCase(
      trainingSchedulesRepository as any,
      exceptionsRepository as any,
    );
  });

  it("should skip a training occurrence successfully", async () => {
    const result = await useCase.execute(
      SCHEDULE_ID,
      { originalDate: "2026-03-23" },
      TENANT_ID,
    );

    expect(result).toHaveProperty("id");
    expect(result.action).toBe("skip");
    expect(exceptionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        trainingScheduleId: SCHEDULE_ID,
        tenantId: TENANT_ID,
        originalDate: "2026-03-23",
        action: "skip",
      }),
    );
  });

  it("should throw NotFoundException when schedule not found", async () => {
    trainingSchedulesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent", { originalDate: "2026-03-23" }, TENANT_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when originalDate does not match dayOfWeek", async () => {
    // 2026-03-25 is Wednesday, schedule is Monday
    await expect(
      useCase.execute(SCHEDULE_ID, { originalDate: "2026-03-25" }, TENANT_ID),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw ConflictException when exception already exists", async () => {
    exceptionsRepository.findByScheduleAndOriginalDate.mockResolvedValue({ id: "existing" });

    await expect(
      useCase.execute(SCHEDULE_ID, { originalDate: "2026-03-23" }, TENANT_ID),
    ).rejects.toThrow(ConflictException);
  });

  it("should pass reason when provided", async () => {
    await useCase.execute(
      SCHEDULE_ID,
      { originalDate: "2026-03-23", reason: "Aluno viajou" },
      TENANT_ID,
    );

    expect(exceptionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "Aluno viajou" }),
    );
  });
});
