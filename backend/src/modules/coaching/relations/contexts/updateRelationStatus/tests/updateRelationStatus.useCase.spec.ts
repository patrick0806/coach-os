import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateRelationStatusUseCase } from "../updateRelationStatus.useCase";

const makeRelation = (overrides = {}) => ({
  id: "relation-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  status: "active",
  startDate: new Date(),
  endDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeCoachStudentRelationsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeRelation()),
  updateStatus: vi.fn().mockResolvedValue(makeRelation()),
});

describe("UpdateRelationStatusUseCase", () => {
  let useCase: UpdateRelationStatusUseCase;
  let coachStudentRelationsRepository: ReturnType<typeof makeCoachStudentRelationsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    coachStudentRelationsRepository = makeCoachStudentRelationsRepository();
    useCase = new UpdateRelationStatusUseCase(coachStudentRelationsRepository as any);
  });

  it("should update relation status", async () => {
    await useCase.execute("relation-id-1", { status: "paused" }, tenantId);

    expect(coachStudentRelationsRepository.updateStatus).toHaveBeenCalledWith(
      "relation-id-1",
      tenantId,
      "paused",
      null,
    );
  });

  it("should set endDate when archiving", async () => {
    await useCase.execute("relation-id-1", { status: "archived" }, tenantId);

    expect(coachStudentRelationsRepository.updateStatus).toHaveBeenCalledWith(
      "relation-id-1",
      tenantId,
      "archived",
      expect.any(Date),
    );
  });

  it("should not set endDate when not archiving", async () => {
    await useCase.execute("relation-id-1", { status: "active" }, tenantId);

    expect(coachStudentRelationsRepository.updateStatus).toHaveBeenCalledWith(
      "relation-id-1",
      tenantId,
      "active",
      null,
    );
  });

  it("should throw NotFoundException when relation not found", async () => {
    coachStudentRelationsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { status: "active" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException on invalid status", async () => {
    await expect(
      useCase.execute("relation-id-1", { status: "invalid" }, tenantId),
    ).rejects.toThrow();
  });
});
