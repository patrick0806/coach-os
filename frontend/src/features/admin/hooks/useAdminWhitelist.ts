"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";

export function useAdminWhitelist() {
  return useQuery({
    queryKey: ["admin", "whitelist"],
    queryFn: () => adminService.getWhitelist(),
  });
}

export function useAddToWhitelist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (personalId: string) => adminService.addToWhitelist(personalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "whitelist"] }),
  });
}

export function useRemoveFromWhitelist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (personalId: string) =>
      adminService.removeFromWhitelist(personalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "whitelist"] }),
  });
}
