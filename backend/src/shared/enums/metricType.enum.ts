export const VALID_METRIC_TYPES = [
  "weight", "body_fat", "waist", "chest", "hip", "bicep", "thigh",
] as const;

export type MetricType = (typeof VALID_METRIC_TYPES)[number];
