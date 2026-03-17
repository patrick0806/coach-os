import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListWorkoutSessionsUseCase } from "../listSessions.useCase";

const makeSession = () => ({
  id: "session-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  workoutDayId: "workout-day-id-1",
  status: "started" as const,
  startedAt: new Date(),
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeWorkoutSessionsRepository = () => ({
  findAllByStudentId: vi.fn().mockResolvedValue({
    rows: [makeSession()],
    total: 1,
  }),
});

describe("ListWorkoutSessionsUseCase", () => {
  let useCase: ListWorkoutSessionsUseCase;
  let workoutSessionsRepository: ReturnType<typeof makeWorkoutSessionsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    workoutSessionsRepository = makeWorkoutSessionsRepository();
    useCase = new ListWorkoutSessionsUseCase(workoutSessionsRepository as any);
  });

  it("should return paginated sessions", async () => {
    const result = await useCase.execute("student-id-1", {}, tenantId);

    expect(result.content).toHaveLength(1);
    expect(result.totalElements).toBe(1);
    expect(result.page).toBe(0);
    expect(result.size).toBe(10);
  });

  it("should apply status filter", async () => {
    await useCase.execute("student-id-1", { status: "finished" }, tenantId);

    expect(workoutSessionsRepository.findAllByStudentId).toHaveBeenCalledWith(
      "student-id-1",
      tenantId,
      expect.objectContaining({ status: "finished" }),
    );
  });

  it("should return empty page when no sessions", async () => {
    workoutSessionsRepository.findAllByStudentId.mockResolvedValue({ rows: [], total: 0 });

    const result = await useCase.execute("student-id-1", {}, tenantId);

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("should return correct pagination metadata", async () => {
    workoutSessionsRepository.findAllByStudentId.mockResolvedValue({
      rows: [makeSession()],
      total: 25,
    });

    const result = await useCase.execute("student-id-1", { page: "1", size: "10" }, tenantId);

    expect(result.page).toBe(1);
    expect(result.size).toBe(10);
    expect(result.totalElements).toBe(25);
    expect(result.totalPages).toBe(3);
  });

  it("should use default pagination values", async () => {
    await useCase.execute("student-id-1", {}, tenantId);

    expect(workoutSessionsRepository.findAllByStudentId).toHaveBeenCalledWith(
      "student-id-1",
      tenantId,
      expect.objectContaining({ page: 0, size: 10 }),
    );
  });
});
