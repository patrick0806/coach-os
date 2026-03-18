export interface CheckinRecord {
  id: string
  metricType: string
  value: string
  unit: string
  notes: string | null
}

export interface CheckinPhoto {
  id: string
  mediaUrl: string
  notes: string | null
}

export interface StudentCheckin {
  id: string
  tenantId: string
  studentId: string
  checkinDate: string
  notes: string | null
  createdAt: string
  updatedAt: string
  records: CheckinRecord[]
  photos: CheckinPhoto[]
}

export interface PaginatedStudentCheckins {
  content: StudentCheckin[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
