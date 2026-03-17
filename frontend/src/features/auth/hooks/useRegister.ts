"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import { authService } from "@/features/auth/services/auth.service";
import type { RegisterRequest } from "@/features/auth/types/auth.types";

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      toast.success("Conta criada com sucesso!");
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao criar conta")
        : "Erro inesperado";
      toast.error(message);
    },
  });
}
