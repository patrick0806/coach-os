"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { studentsService } from "@/features/students/services/students.service"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/shared/ui/field"

const schema = z
  .object({
    name: z.string().min(3, "Nome deve ter ao menos 3 caracteres").max(150),
    password: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter ao menos um número"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  return score as 0 | 1 | 2 | 3
}

const strengthConfig = {
  0: { label: "", color: "" },
  1: { label: "Fraca", color: "bg-destructive" },
  2: { label: "Média", color: "bg-warning" },
  3: { label: "Forte", color: "bg-success" },
} as const

interface AcceptStudentInviteFormProps {
  slug: string
}

export function AcceptStudentInviteForm({ slug }: AcceptStudentInviteFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      studentsService.acceptInvite({ token, name: values.name, password: values.password }),
    onSuccess: () => {
      toast.success("Conta criada com sucesso! Faça login para continuar.")
      router.push(`/coach/${slug}/login`)
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Link inválido ou expirado")
        : "Erro inesperado"
      toast.error(message)
    },
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const password = useWatch({ control, name: "password", defaultValue: "" })
  const strength = getPasswordStrength(password)
  const { label: strengthLabel, color: strengthColor } = strengthConfig[strength]

  if (!token) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Link inválido</h1>
        <p className="text-sm text-muted-foreground">
          O link de convite está ausente ou é inválido. Solicite um novo convite ao seu treinador.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Criar sua conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha seus dados para acessar a plataforma do seu treinador.
        </p>
      </div>

      <form onSubmit={handleSubmit((v) => mutate(v))} noValidate>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="name">Nome completo</FieldLabel>
            <Input
              id="name"
              placeholder="Seu nome"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="pr-10"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {strength > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength ? strengthColor : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs transition-colors duration-300 ${strengthColor.replace("bg-", "text-")}`}>
                  {strengthLabel}
                </p>
              </div>
            )}
            <FieldError errors={[errors.password]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repita a senha"
                className="pr-10"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError errors={[errors.confirmPassword]} />
          </Field>

          <Button
            type="submit"
            variant="premium"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Criando conta..." : "Criar conta"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
