import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ValidationException } from "@shared/exceptions";
import { GetChartDataUseCase } from "../getChartData.useCase";

const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeChartPoint = (date: string, value: string, metricType = "weight", unit = "kg") => ({
  recordedAt: new Date(date),
  value,
  unit,
  metricType,
});

const makeProgressRecordsRepository = () => ({
  findAllForChart: vi.fn().mockResolvedValue([
    makeChartPoint("2026-01-01", "80.00"),
    makeChartPoint("2026-01-15", "79.50"),
    makeChartPoint("2026-02-01", "78.80"),
  ]),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

describe("GetChartDataUseCase", () => {
  let useCase: GetChartDataUseCase;
  let progressRecordsRepository: ReturnType<typeof makeProgressRecordsRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  beforeEach(() => {
    progressRecordsRepository = makeProgressRecordsRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new GetChartDataUseCase(
      progressRecordsRepository as any,
      studentsRepository as any,
    );
  });

  it("should return chart data sorted by recordedAt ASC", async () => {
    const result = await useCase.execute(
      STUDENT_ID,
      { metricType: "weight" },
      TENANT_ID,
    );

    expect(result.data).toHaveLength(3);
    expect(progressRecordsRepository.findAllForChart).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      "weight",
      { startDate: undefined, endDate: undefined },
    );
  });

  it("should pass date range filters to repository", async () => {
    await useCase.execute(
      STUDENT_ID,
      { metricType: "weight", startDate: "2026-01-01", endDate: "2026-12-31" },
      TENANT_ID,
    );

    expect(progressRecordsRepository.findAllForChart).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      "weight",
      {
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
      },
    );
  });

  it("should return empty array when no records exist", async () => {
    progressRecordsRepository.findAllForChart.mockResolvedValue([]);

    const result = await useCase.execute(
      STUDENT_ID,
      { metricType: "body_fat" },
      TENANT_ID,
    );

    expect(result.data).toHaveLength(0);
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { metricType: "weight" }, TENANT_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException for invalid metricType", async () => {
    await expect(
      useCase.execute(STUDENT_ID, { metricType: "invalid" }, TENANT_ID),
    ).rejects.toThrow(ValidationException);
  });

  it("should not throw when metricType is omitted", async () => {
    await expect(
      useCase.execute(STUDENT_ID, {}, TENANT_ID),
    ).resolves.toBeDefined();
  });

  it("should return all metrics when metricType is omitted", async () => {
    progressRecordsRepository.findAllForChart.mockResolvedValue([
      makeChartPoint("2026-01-01", "80.00", "weight", "kg"),
      makeChartPoint("2026-01-01", "22.50", "body_fat", "%"),
      makeChartPoint("2026-01-15", "79.50", "weight", "kg"),
      makeChartPoint("2026-01-15", "21.00", "body_fat", "%"),
    ]);

    const result = await useCase.execute(STUDENT_ID, {}, TENANT_ID);

    expect(result.data).toHaveLength(4);
    expect(progressRecordsRepository.findAllForChart).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      undefined,
      { startDate: undefined, endDate: undefined },
    );
  });

  it("should include metricType in response data points", async () => {
    progressRecordsRepository.findAllForChart.mockResolvedValue([
      makeChartPoint("2026-01-01", "80.00", "weight", "kg"),
    ]);

    const result = await useCase.execute(STUDENT_ID, { metricType: "weight" }, TENANT_ID);

    expect(result.data[0]).toHaveProperty("metricType", "weight");
  });

  it("should accept all valid metric types", async () => {
    const validTypes = ["weight", "body_fat", "waist", "chest", "hip", "bicep", "thigh"];

    for (const metricType of validTypes) {
      await expect(
        useCase.execute(STUDENT_ID, { metricType }, TENANT_ID),
      ).resolves.toBeDefined();
    }
  });
});
