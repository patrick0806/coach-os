"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { useLogin } from "@/features/auth/hooks/useLogin";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/shared/ui/field";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(values: LoginFormValues) {
    login(values);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesse sua conta do Coach OS
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FieldError errors={[errors.password]} />
          </Field>

          <div className="flex justify-end">
            <Link
              href="/esqueci-senha"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button
            type="submit"
            variant="premium"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
