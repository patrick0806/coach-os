import { describe, expect, it } from "vitest";

import { ValidationException } from "@shared/exceptions";
import { validate } from "@shared/utils";

import { CreateBookingSeriesSchema } from "../dtos/request.dto";

const validPayload = {
  studentId: "550e8400-e29b-41d4-a716-446655440001",
  servicePlanId: "550e8400-e29b-41d4-a716-446655440000",
  daysOfWeek: [1, 3, 5],
  startTime: "08:00",
  endTime: "09:00",
  seriesStartDate: "2024-01-01",
  seriesEndDate: "2024-03-31",
  notes: "Sessao recorrente",
};

describe("CreateBookingSeriesSchema", () => {
  it("should return parsed data for a valid recurring booking payload", () => {
    const result = validate(CreateBookingSeriesSchema, validPayload);

    expect(result).toEqual(validPayload);
  });

  it("should collect repeated weekday and invalid time range errors", () => {
    const attempt = () =>
      validate(CreateBookingSeriesSchema, {
        ...validPayload,
        daysOfWeek: [1, 1, 3],
        startTime: "10:00",
        endTime: "09:00",
      });

    expect(attempt).toThrowError(ValidationException);

    try {
      attempt();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      expect((error as ValidationException).fields).toEqual([
        {
          name: "daysOfWeek",
          reason: "daysOfWeek não pode ter dias repetidos",
        },
        {
          name: "startTime",
          reason: "startTime deve ser anterior a endTime",
        },
      ]);
    }
  });

  it("should reject recurring ranges longer than six months", () => {
    const attempt = () =>
      validate(CreateBookingSeriesSchema, {
        ...validPayload,
        seriesEndDate: "2024-08-01",
      });

    expect(attempt).toThrowError(ValidationException);

    try {
      attempt();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      expect((error as ValidationException).fields).toEqual([
        {
          name: "seriesEndDate",
          reason: "Período máximo para recorrência é de 6 meses",
        },
      ]);
    }
  });
});
