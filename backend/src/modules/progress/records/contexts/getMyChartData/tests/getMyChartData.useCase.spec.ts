import { describe, it, expect, beforeEach, vi } from "vitest";
import { ValidationException } from "@shared/exceptions";
import { GetMyChartDataUseCase } from "../getMyChartData.useCase";

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
  ]),
});

describe("GetMyChartDataUseCase", () => {
  let useCase: GetMyChartDataUseCase;
  let progressRecordsRepository: ReturnType<typeof makeProgressRecordsRepository>;

  beforeEach(() => {
    progressRecordsRepository = makeProgressRecordsRepository();
    useCase = new GetMyChartDataUseCase(progressRecordsRepository as any);
  });

  it("should return chart data for the authenticated student", async () => {
    const result = await useCase.execute(
      STUDENT_ID,
      TENANT_ID,
      { metricType: "weight" },
    );

    expect(result.data).toHaveLength(2);
    expect(progressRecordsRepository.findAllForChart).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      "weight",
      { startDate: undefined, endDate: undefined },
    );
  });

  it("should pass date range filters", async () => {
    await useCase.execute(
      STUDENT_ID,
      TENANT_ID,
      { metricType: "waist", startDate: "2026-01-01", endDate: "2026-06-30" },
    );

    expect(progressRecordsRepository.findAllForChart).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      "waist",
      {
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-06-30"),
      },
    );
  });

  it("should return empty array when no records exist", async () => {
    progressRecordsRepository.findAllForChart.mockResolvedValue([]);

    const result = await useCase.execute(STUDENT_ID, TENANT_ID, { metricType: "body_fat" });

    expect(result.data).toHaveLength(0);
  });

  it("should throw ValidationException for invalid metricType", async () => {
    await expect(
      useCase.execute(STUDENT_ID, TENANT_ID, { metricType: "invalid" }),
    ).rejects.toThrow(ValidationException);
  });

  it("should return all metrics when metricType is omitted", async () => {
    progressRecordsRepository.findAllForChart.mockResolvedValue([
      makeChartPoint("2026-01-01", "80.00", "weight", "kg"),
      makeChartPoint("2026-01-01", "22.50", "body_fat", "%"),
    ]);

    const result = await useCase.execute(STUDENT_ID, TENANT_ID, {});

    expect(result.data).toHaveLength(2);
    expect(progressRecordsRepository.findAllForChart).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      undefined,
      { startDate: undefined, endDate: undefined },
    );
  });

  it("should include metricType in response data points", async () => {
    const result = await useCase.execute(STUDENT_ID, TENANT_ID, { metricType: "weight" });

    expect(result.data[0]).toHaveProperty("metricType", "weight");
  });
});
