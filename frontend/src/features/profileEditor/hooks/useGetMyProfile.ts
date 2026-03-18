"use client"

import { useQuery } from "@tanstack/react-query"
import { profileService } from "@/features/profileEditor/services/profile.service"

export function useGetMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: () => profileService.getMyProfile(),
  })
}
