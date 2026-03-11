import { api } from "@/lib/api";

export interface StudentNote {
  id: string;
  studentId: string;
  personalId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedStudentNotes {
  items: StudentNote[];
  page: number;
  size: number;
  total: number;
}

export interface CreateStudentNotePayload {
  note: string;
}

export interface UpdateStudentNotePayload {
  note: string;
}

export async function listStudentNotes(
  studentId: string,
  params: { page?: number; size?: number } = {},
): Promise<PaginatedStudentNotes> {
  const { data } = await api.get<PaginatedStudentNotes>(`/students/${studentId}/notes`, { params });
  return data;
}

export async function createStudentNote(
  studentId: string,
  payload: CreateStudentNotePayload,
): Promise<StudentNote> {
  const { data } = await api.post<StudentNote>(`/students/${studentId}/notes`, payload);
  return data;
}

export async function updateStudentNote(
  noteId: string,
  payload: UpdateStudentNotePayload,
): Promise<StudentNote> {
  const { data } = await api.patch<StudentNote>(`/students/notes/${noteId}`, payload);
  return data;
}

export async function deleteStudentNote(noteId: string): Promise<void> {
  await api.delete(`/students/notes/${noteId}`);
}
