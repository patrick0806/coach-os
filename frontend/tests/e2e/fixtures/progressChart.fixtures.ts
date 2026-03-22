export const MOCK_STUDENT_ID = "student-chart-test-id"

// API returns array directly (BuildResponseInterceptor unwraps { data } wrapper)
export const MOCK_WEIGHT_CHART_DATA = [
  { recordedAt: "2026-01-05T10:00:00Z", value: "82.00", unit: "kg" },
  { recordedAt: "2026-01-15T10:00:00Z", value: "81.20", unit: "kg" },
  { recordedAt: "2026-02-01T10:00:00Z", value: "80.50", unit: "kg" },
  { recordedAt: "2026-02-15T10:00:00Z", value: "79.80", unit: "kg" },
  { recordedAt: "2026-03-01T10:00:00Z", value: "79.00", unit: "kg" },
]

export const MOCK_BODY_FAT_CHART_DATA = [
  { recordedAt: "2026-01-05T10:00:00Z", value: "22.50", unit: "%" },
  { recordedAt: "2026-02-01T10:00:00Z", value: "21.00", unit: "%" },
  { recordedAt: "2026-03-01T10:00:00Z", value: "19.80", unit: "%" },
]

export const MOCK_EMPTY_CHART_DATA: typeof MOCK_WEIGHT_CHART_DATA = []

// Combined data returned when metricType is not specified (all metrics)
export const MOCK_ALL_METRICS_CHART_DATA = [
  { recordedAt: "2026-01-05T10:00:00Z", value: "82.00", unit: "kg", metricType: "weight" },
  { recordedAt: "2026-01-05T10:00:00Z", value: "22.50", unit: "%", metricType: "body_fat" },
  { recordedAt: "2026-01-15T10:00:00Z", value: "81.20", unit: "kg", metricType: "weight" },
  { recordedAt: "2026-02-01T10:00:00Z", value: "80.50", unit: "kg", metricType: "weight" },
  { recordedAt: "2026-02-01T10:00:00Z", value: "21.00", unit: "%", metricType: "body_fat" },
  { recordedAt: "2026-02-01T10:00:00Z", value: "85.00", unit: "cm", metricType: "waist" },
  { recordedAt: "2026-03-01T10:00:00Z", value: "79.00", unit: "kg", metricType: "weight" },
  { recordedAt: "2026-03-01T10:00:00Z", value: "19.80", unit: "%", metricType: "body_fat" },
  { recordedAt: "2026-03-01T10:00:00Z", value: "82.00", unit: "cm", metricType: "waist" },
]
