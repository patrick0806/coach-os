import { api } from "@/lib/api";

export interface Student {
  id: string;
  userId: string;
  personalId: string;
  servicePlanId: string;
  servicePlanName: string | null;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface StudentDetail extends Student {
  updatedAt: string;
}

export interface PaginatedStudents {
  content: Student[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateStudentPayload {
  name: string;
  email: string;
  servicePlanId: string;
}

export interface CreateStudentResponse {
  studentId: string;
  userId: string;
  name: string;
  email: string;
  personalId: string;
  servicePlanId: string;
  servicePlanName: string | null;
  createdAt: string;
}

export interface UpdateStudentPayload {
  name?: string;
  email?: string;
  servicePlanId?: string;
}

export interface ListStudentsParams {
  page?: number;
  size?: number;
  search?: string;
}

export async function listStudents(params: ListStudentsParams = {}): Promise<PaginatedStudents> {
  const { data } = await api.get<PaginatedStudents>("/students", { params });
  return data;
}

export async function getStudent(id: string): Promise<StudentDetail> {
  const { data } = await api.get<StudentDetail>(`/students/${id}`);
  return data;
}

export async function createStudent(payload: CreateStudentPayload): Promise<CreateStudentResponse> {
  const { data } = await api.post<CreateStudentResponse>("/students", payload);
  return data;
}

export async function updateStudent(
  id: string,
  payload: UpdateStudentPayload,
): Promise<StudentDetail> {
  const { data } = await api.patch<StudentDetail>(`/students/${id}`, payload);
  return data;
}

export async function deactivateStudent(id: string): Promise<void> {
  await api.delete(`/students/${id}`);
}
