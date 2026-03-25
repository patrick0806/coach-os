"use client";
import { useMutation } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import type { InviteCoachRequest } from "../types/admin.types";

export function useInviteCoach() {
  return useMutation({
    mutationFn: (data: InviteCoachRequest) => adminService.inviteCoach(data),
  });
}
