import { Injectable } from "@nestjs/common";

import { MuscleGroup, MUSCLE_GROUP_LABELS } from "@shared/enums";

import { EnumOptionDTO } from "../../dtos/enumOption.dto";

@Injectable()
export class ListMuscleGroupsUseCase {
  execute(): EnumOptionDTO[] {
    return Object.values(MuscleGroup).map((value) => ({
      value,
      label: MUSCLE_GROUP_LABELS[value],
    }));
  }
}
