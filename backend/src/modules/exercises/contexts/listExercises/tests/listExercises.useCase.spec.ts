import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListExercisesUseCase } from "../listExercises.useCase";

const makeExercise = (overrides = {}) => ({
  id: "exercise-id-1",
  name: "Supino Reto",
  muscleGroup: "peitoral",
  description: null,
  instructions: null,
  mediaUrl: null,
  youtubeUrl: null,
  tenantId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeExercisesRepository = () => ({
  findAllVisible: vi.fn().mockResolvedValue({
    rows: [makeExercise()],
    total: 1,
  }),
});

describe("ListExercisesUseCase", () => {
  let useCase: ListExercisesUseCase;
  let exercisesRepository: ReturnType<typeof makeExercisesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    exercisesRepository = makeExercisesRepository();
    useCase = new ListExercisesUseCase(exercisesRepository as any);
  });

  it("should return paginated exercises", async () => {
    const result = await useCase.execute({ page: "0", size: "10" }, tenantId);

    expect(result.content).toHaveLength(1);
    expect(result.page).toBe(0);
    expect(result.size).toBe(10);
    expect(result.totalElements).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("should use default pagination when no params provided", async () => {
    await useCase.execute({}, tenantId);

    expect(exercisesRepository.findAllVisible).toHaveBeenCalledWith(
      tenantId,
      expect.objectContaining({ page: 0, size: 10 }),
    );
  });

  it("should pass search filter to repository", async () => {
    await useCase.execute({ search: "supino" }, tenantId);

    expect(exercisesRepository.findAllVisible).toHaveBeenCalledWith(
      tenantId,
      expect.objectContaining({ search: "supino" }),
    );
  });

  it("should pass muscleGroup filter to repository", async () => {
    await useCase.execute({ muscleGroup: "peitoral" }, tenantId);

    expect(exercisesRepository.findAllVisible).toHaveBeenCalledWith(
      tenantId,
      expect.objectContaining({ muscleGroup: "peitoral" }),
    );
  });

  it("should calculate totalPages correctly", async () => {
    exercisesRepository.findAllVisible.mockResolvedValue({ rows: [], total: 25 });

    const result = await useCase.execute({ size: "10" }, tenantId);

    expect(result.totalPages).toBe(3);
  });

  it("should return empty content when no exercises found", async () => {
    exercisesRepository.findAllVisible.mockResolvedValue({ rows: [], total: 0 });

    const result = await useCase.execute({}, tenantId);

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
