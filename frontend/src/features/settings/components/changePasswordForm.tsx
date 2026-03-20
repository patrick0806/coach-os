"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { z } from "zod"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { useChangePassword } from "@/features/settings/hooks/useChangePassword"

const schema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z.string().min(8, "Nova senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const changePassword = useChangePassword()

  function onSubmit(values: FormValues) {
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          form.reset()
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar senha</CardTitle>
        <CardDescription>
          Atualize sua senha de acesso. Todos os dispositivos serão desconectados após a alteração.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="currentPassword">Senha atual</FieldLabel>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Digite sua senha atual"
                  className="pr-10"
                  {...form.register("currentPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError errors={[form.formState.errors.currentPassword]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="newPassword">Nova senha</FieldLabel>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10"
                  {...form.register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError errors={[form.formState.errors.newPassword]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirmar nova senha</FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repita a nova senha"
                  className="pr-10"
                  {...form.register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError errors={[form.formState.errors.confirmPassword]} />
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? "Salvando..." : "Alterar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
