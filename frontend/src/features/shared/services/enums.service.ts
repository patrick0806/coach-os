import { api } from "@/lib/axios"

export interface EnumOption {
  value: string
  label: string
}

export const enumsService = {
  listMuscleGroups: async (): Promise<EnumOption[]> =>
    (await api.get<EnumOption[]>("/enums/muscle-groups")).data,

  listAttendanceTypes: async (): Promise<EnumOption[]> =>
    (await api.get<EnumOption[]>("/enums/attendance-types")).data,
}
