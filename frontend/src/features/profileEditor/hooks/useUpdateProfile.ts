"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { profileService, UpdateProfileData } from "@/features/profileEditor/services/profile.service"

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileData) => profileService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] })
    },
  })
}
