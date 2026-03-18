import { Injectable } from "@nestjs/common";

import { AttendanceType, ATTENDANCE_TYPE_LABELS } from "@shared/enums";

import { EnumOptionDTO } from "../../dtos/enumOption.dto";

@Injectable()
export class ListAttendanceTypesUseCase {
  execute(): EnumOptionDTO[] {
    return Object.values(AttendanceType).map((value) => ({
      value,
      label: ATTENDANCE_TYPE_LABELS[value],
    }));
  }
}
