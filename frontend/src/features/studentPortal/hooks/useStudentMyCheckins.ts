"use client"

import { useQuery } from "@tanstack/react-query"
import { studentPortalCheckinsService } from "@/features/studentPortal/services/studentPortalCheckins.service"

export function useStudentMyCheckins(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ["student-portal", "my-checkins", params],
    queryFn: () => studentPortalCheckinsService.listMyCheckins(params),
  })
}
