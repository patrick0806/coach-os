"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Dumbbell, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import Link from "next/link"

import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { useStudentLogin } from "@/features/studentAuth/hooks/useStudentLogin"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface StudentLoginFormProps {
  coachName?: string
  coachLogoUrl?: string | null
  slug?: string
  hrefPrefix?: string
}

export function StudentLoginForm({ coachName, coachLogoUrl, slug, hrefPrefix = "" }: StudentLoginFormProps) {
  const { mutate: login, isPending } = useStudentLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(values: LoginFormValues) {
    login(values)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        {/* Coach branding */}
        <div className="flex flex-col items-center gap-3 text-center">
          {coachLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coachLogoUrl}
              alt={coachName ?? "Coach"}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Dumbbell className="h-7 w-7 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold">
              {coachName ? `Portal do Aluno — ${coachName}` : "Portal do Aluno"}
            </h1>
            <p className="text-sm text-muted-foreground">Entre com suas credenciais</p>
          </div>
        </div>

        {/* Login form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Acessar conta</CardTitle>
            <CardDescription>Use o email e senha cadastrados pelo seu treinador</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="student-login-form">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  data-testid="email-input"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {slug && (
                    <Link
                      href={`${hrefPrefix}/esqueci-senha`}
                      className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Esqueceu sua senha?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  data-testid="password-input"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full min-h-12"
                disabled={isPending}
                data-testid="submit-button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
