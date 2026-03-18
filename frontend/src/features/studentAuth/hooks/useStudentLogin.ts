"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { studentAuthService } from "@/features/studentAuth/services/studentAuth.service"
import type { StudentLoginRequest } from "@/features/studentAuth/types/studentAuth.types"

export function useStudentLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: StudentLoginRequest) => studentAuthService.login(data),
    onSuccess: () => {
      router.push("/aluno/treinos")
    },
    onError: () => {
      toast.error("Email ou senha inválidos. Tente novamente.")
    },
  })
}
