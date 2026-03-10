import { describe, it, expect } from "vitest";

import { generateAvailabilitySlots } from "../availability.utils";

describe("generateAvailabilitySlots", () => {
  it("should generate slots without breaks", () => {
    const slots = generateAvailabilitySlots("09:00", "12:00", 60);

    expect(slots).toEqual([
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "10:00", endTime: "11:00" },
      { startTime: "11:00", endTime: "12:00" },
    ]);
  });

  it("should skip overlapping slots and continue after break end", () => {
    const slots = generateAvailabilitySlots("09:00", "13:00", 60, "11:00", "12:00");

    expect(slots).toEqual([
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "10:00", endTime: "11:00" },
      { startTime: "12:00", endTime: "13:00" },
    ]);
  });

  it("should return empty array when interval is smaller than slot duration", () => {
    const slots = generateAvailabilitySlots("09:00", "09:30", 60);

    expect(slots).toEqual([]);
  });
});
