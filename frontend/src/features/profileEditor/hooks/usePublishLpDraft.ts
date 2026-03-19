import { useMutation, useQueryClient } from "@tanstack/react-query"

import { profileService } from "@/features/profileEditor/services/profile.service"

export function usePublishLpDraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileService.publishLpDraft(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] })
    },
  })
}
