import axios from "axios";

interface ApiErrorDetail {
  message?: string;
  additionalProperties?: Record<string, unknown>[];
}

interface ApiErrorResponse {
  message?: string;
  details?: ApiErrorDetail[];
}

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return typeof data === "object" && data !== null;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const data = error.response?.data;
  if (!isApiErrorResponse(data)) {
    return fallbackMessage;
  }

  if (typeof data.message === "string" && data.message.trim().length > 0) {
    return data.message;
  }

  return fallbackMessage;
}

export function getApiFieldErrors(error: unknown) {
  const fieldErrors: Record<string, string> = {};

  if (!axios.isAxiosError(error)) {
    return fieldErrors;
  }

  const data = error.response?.data;
  if (!isApiErrorResponse(data) || !Array.isArray(data.details)) {
    return fieldErrors;
  }

  for (const detail of data.details) {
    if (!Array.isArray(detail.additionalProperties)) {
      continue;
    }

    for (const item of detail.additionalProperties) {
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === "string" && value.trim().length > 0) {
          fieldErrors[key] = value;
        }
      }
    }
  }

  return fieldErrors;
}
