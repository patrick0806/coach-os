"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";

export function useAdminTenants(params: {
  page?: number;
  size?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin", "tenants", params],
    queryFn: () => adminService.getTenants(params),
  });
}

export function useAdminTenant(id: string) {
  return useQuery({
    queryKey: ["admin", "tenants", id],
    queryFn: () => adminService.getTenant(id),
  });
}

export function useUpdateTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      accessStatus,
    }: {
      id: string;
      accessStatus: string;
    }) => adminService.updateTenantStatus(id, accessStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tenants"] });
    },
  });
}
