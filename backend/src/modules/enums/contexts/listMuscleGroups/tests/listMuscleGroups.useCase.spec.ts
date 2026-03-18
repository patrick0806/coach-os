import { describe, it, expect, beforeEach } from "vitest";

import { MuscleGroup } from "@shared/enums";

import { ListMuscleGroupsUseCase } from "../listMuscleGroups.useCase";

describe("ListMuscleGroupsUseCase", () => {
  let useCase: ListMuscleGroupsUseCase;

  beforeEach(() => {
    useCase = new ListMuscleGroupsUseCase();
  });

  it("should return all muscle group options", () => {
    const result = useCase.execute();

    expect(result).toHaveLength(Object.values(MuscleGroup).length);
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

  it("should return correct value for peitoral", () => {
    const result = useCase.execute();

    const peitoral = result.find((o) => o.value === MuscleGroup.PEITORAL);
    expect(peitoral).toBeDefined();
    expect(peitoral?.label).toBe("Peitoral");
  });

  it("should return correct value for costas", () => {
    const result = useCase.execute();

    const costas = result.find((o) => o.value === MuscleGroup.COSTAS);
    expect(costas).toBeDefined();
    expect(costas?.label).toBe("Costas");
  });

  it("should include all expected muscle groups", () => {
    const result = useCase.execute();
    const values = result.map((o) => o.value);

    expect(values).toContain(MuscleGroup.PEITORAL);
    expect(values).toContain(MuscleGroup.COSTAS);
    expect(values).toContain(MuscleGroup.OMBROS);
    expect(values).toContain(MuscleGroup.BICEPS);
    expect(values).toContain(MuscleGroup.TRICEPS);
    expect(values).toContain(MuscleGroup.PERNAS);
    expect(values).toContain(MuscleGroup.GLUTEOS);
    expect(values).toContain(MuscleGroup.ABDOMEN);
    expect(values).toContain(MuscleGroup.PANTURRILHA);
    expect(values).toContain(MuscleGroup.ANTEBRACO);
    expect(values).toContain(MuscleGroup.TRAPEZIO);
    expect(values).toContain(MuscleGroup.FUNCIONAL);
  });
});
