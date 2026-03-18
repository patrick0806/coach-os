import { studentApi } from "@/lib/studentAxios"
import type {
  PaginatedStudentPrograms,
  StudentProgramDetail,
} from "@/features/studentPrograms/types/studentPrograms.types"

export const studentPortalProgramsService = {
  listActivePrograms: async (): Promise<PaginatedStudentPrograms> =>
    (await studentApi.get<PaginatedStudentPrograms>("/student-programs/me")).data,

  getProgramDetail: async (id: string): Promise<StudentProgramDetail> =>
    (await studentApi.get<StudentProgramDetail>(`/student-programs/${id}`)).data,
}
