"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import { authService } from "@/features/auth/services/auth.service";
import type { LoginRequest } from "@/features/auth/types/auth.types";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao fazer login")
        : "Erro inesperado";
      toast.error(message);
    },
  });
}
