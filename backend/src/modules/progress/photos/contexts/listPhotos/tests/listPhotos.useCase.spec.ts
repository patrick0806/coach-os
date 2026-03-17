import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ListProgressPhotosUseCase } from "../listPhotos.useCase";

const PHOTO_ID = "d4e5f6a7-b8c9-0123-defa-234567890123";
const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makePhoto = (overrides = {}) => ({
  id: PHOTO_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  mediaUrl: "https://bucket.s3.us-east-1.amazonaws.com/progress-photos/...",
  notes: null,
  createdAt: new Date(),
  ...overrides,
});

const makeProgressPhotosRepository = () => ({
  findAllByStudentId: vi.fn().mockResolvedValue({ rows: [makePhoto()], total: 1 }),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

describe("ListProgressPhotosUseCase", () => {
  let useCase: ListProgressPhotosUseCase;
  let progressPhotosRepository: ReturnType<typeof makeProgressPhotosRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  const tenantId = TENANT_ID;

  beforeEach(() => {
    progressPhotosRepository = makeProgressPhotosRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new ListProgressPhotosUseCase(
      progressPhotosRepository as any,
      studentsRepository as any,
    );
  });

  it("should return paginated progress photos", async () => {
    const result = await useCase.execute(STUDENT_ID, {}, tenantId);

    expect(result.content).toHaveLength(1);
    expect(result.page).toBe(0);
    expect(result.size).toBe(10);
    expect(result.totalElements).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("should return empty page when no photos exist", async () => {
    progressPhotosRepository.findAllByStudentId.mockResolvedValue({ rows: [], total: 0 });

    const result = await useCase.execute(STUDENT_ID, {}, tenantId);

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", {}, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should use default pagination values when not provided", async () => {
    await useCase.execute(STUDENT_ID, {}, tenantId);

    expect(progressPhotosRepository.findAllByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      tenantId,
      expect.objectContaining({ page: 0, size: 10 }),
    );
  });

  it("should respect custom pagination", async () => {
    progressPhotosRepository.findAllByStudentId.mockResolvedValue({ rows: [], total: 20 });

    const result = await useCase.execute(STUDENT_ID, { page: 1, size: 5 }, tenantId);

    expect(result.page).toBe(1);
    expect(result.size).toBe(5);
    expect(result.totalPages).toBe(4);
  });

  it("should enforce tenant isolation via student lookup", async () => {
    await useCase.execute(STUDENT_ID, {}, tenantId);

    expect(studentsRepository.findById).toHaveBeenCalledWith(STUDENT_ID, tenantId);
  });
});
