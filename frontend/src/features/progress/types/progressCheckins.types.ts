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

export interface ProgressCheckin {
  id: string
  tenantId: string
  studentId: string
  checkinDate: string
  notes: string | null
  records: CheckinRecord[]
  photos: CheckinPhoto[]
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateCheckinRecordInput {
  metricType: string
  value: number
  unit: string
  notes?: string
}

export interface CreateCheckinPhotoInput {
  mediaUrl: string
  notes?: string
}

export interface CreateCheckinRequest {
  checkinDate: string
  notes?: string
  records: CreateCheckinRecordInput[]
  photos: CreateCheckinPhotoInput[]
}

export interface CheckinsResponse {
  content: ProgressCheckin[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ListCheckinsParams {
  page?: number
  size?: number
}
