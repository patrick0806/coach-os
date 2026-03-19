"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";

export function useAdminAdmins() {
  return useQuery({
    queryKey: ["admin", "admins"],
    queryFn: () => adminService.getAdmins(),
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      adminService.createAdmin(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "admins"] }),
  });
}

export function useDeleteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "admins"] }),
  });
}
