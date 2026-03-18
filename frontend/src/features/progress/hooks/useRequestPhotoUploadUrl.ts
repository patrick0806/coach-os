"use client"

import { useMutation } from "@tanstack/react-query"

import { progressService } from "@/features/progress/services/progress.service"

export function useRequestPhotoUploadUrl(studentId: string) {
  return useMutation({
    mutationFn: (mimeType: string) =>
      progressService.requestPhotoUploadUrl(studentId, mimeType),
  })
}
