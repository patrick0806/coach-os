import { useMutation, useQueryClient } from "@tanstack/react-query"

import { profileService, type LpDraftData } from "@/features/profileEditor/services/profile.service"

export function useSaveLpDraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LpDraftData) => profileService.saveLpDraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] })
    },
  })
}
