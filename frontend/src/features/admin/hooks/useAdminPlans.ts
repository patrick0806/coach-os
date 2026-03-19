"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";

export function useAdminPlans() {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: () => adminService.getPlans(),
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminService.createPlan>[0]) =>
      adminService.createPlan(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "plans"] }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof adminService.updatePlan>[1];
    }) => adminService.updatePlan(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "plans"] }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deletePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "plans"] }),
  });
}
