import { describe, it, expect, beforeEach } from "vitest";

import { AttendanceType } from "@shared/enums";

import { ListAttendanceTypesUseCase } from "../listAttendanceTypes.useCase";

describe("ListAttendanceTypesUseCase", () => {
  let useCase: ListAttendanceTypesUseCase;

  beforeEach(() => {
    useCase = new ListAttendanceTypesUseCase();
  });

  it("should return all attendance type options", () => {
    const result = useCase.execute();

    expect(result).toHaveLength(Object.values(AttendanceType).length);
  });

  it("should return options with value and label", () => {
    const result = useCase.execute();

    result.forEach((option) => {
      expect(option).toHaveProperty("value");
      expect(option).toHaveProperty("label");
      expect(typeof option.value).toBe("string");
      expect(typeof option.label).toBe("string");
    });
  });

  it("should return online with portuguese label", () => {
    const result = useCase.execute();

    const online = result.find((o) => o.value === AttendanceType.ONLINE);
    expect(online).toBeDefined();
    expect(online?.label).toBe("Online");
  });

  it("should return presential with portuguese label", () => {
    const result = useCase.execute();

    const presential = result.find((o) => o.value === AttendanceType.PRESENTIAL);
    expect(presential).toBeDefined();
    expect(presential?.label).toBe("Presencial");
  });

  it("should include both attendance types", () => {
    const result = useCase.execute();
    const values = result.map((o) => o.value);

    expect(values).toContain(AttendanceType.ONLINE);
    expect(values).toContain(AttendanceType.PRESENTIAL);
  });
});
