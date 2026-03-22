export type MetricType = 'weight' | 'body_fat' | 'waist' | 'chest' | 'hip' | 'bicep' | 'thigh'

export const METRIC_TYPE_LABELS: Record<MetricType, string> = {
  weight: 'Peso',
  body_fat: '% Gordura',
  waist: 'Cintura',
  chest: 'Peitoral',
  hip: 'Quadril',
  bicep: 'Bíceps',
  thigh: 'Coxa',
}

export const METRIC_TYPE_UNITS: Record<MetricType, string> = {
  weight: 'kg',
  body_fat: '%',
  waist: 'cm',
  chest: 'cm',
  hip: 'cm',
  bicep: 'cm',
  thigh: 'cm',
}

export const METRIC_TYPES: MetricType[] = [
  'weight',
  'body_fat',
  'waist',
  'chest',
  'hip',
  'bicep',
  'thigh',
]

export interface ProgressRecord {
  id: string
  tenantId: string
  studentId: string
  metricType: MetricType
  value: string
  unit: string
  recordedAt: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ProgressPhoto {
  id: string
  tenantId: string
  studentId: string
  mediaUrl: string
  notes: string | null
  createdAt: string
}

export interface CreateProgressRecordRequest {
  metricType: MetricType
  value: number
  unit: string
  recordedAt: string
  notes?: string
}

export interface UpdateProgressRecordRequest {
  metricType?: MetricType
  value?: number
  unit?: string
  recordedAt?: string
  notes?: string
}

export interface ProgressRecordsResponse {
  content: ProgressRecord[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ProgressPhotosResponse {
  content: ProgressPhoto[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ListProgressRecordsParams {
  page?: number
  size?: number
  metricType?: MetricType
}

export interface ListProgressPhotosParams {
  page?: number
  size?: number
}

export interface ProgressChartDataPoint {
  recordedAt: string
  value: string
  unit: string
  metricType?: string
}

export interface GetChartDataParams {
  metricType?: MetricType
  startDate?: string
  endDate?: string
}

export interface RequestPhotoUploadUrlResponse {
  uploadUrl: string
  fileUrl: string
}
