"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

const setupPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam ser iguais",
    path: ["confirmPassword"],
  });

type SetupPasswordFormValues = z.infer<typeof setupPasswordSchema>;

async function setupPassword(token: string, password: string) {
  const { data } = await api.post<{ message: string }>("/auth/setup-password", {
    token,
    password,
    confirmPassword: password,
  });
  return data;
}

export default function SetPasswordPage() {
  const params = useParams<{ "slug-personal": string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const slug = params["slug-personal"];

  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupPasswordFormValues>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SetupPasswordFormValues) {
    if (!token) return;
    setSubmitError(null);

    try {
      await setupPassword(token, values.password);
      setSuccess(true);
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Não foi possível definir sua senha. Tente novamente."),
      );
    }
  }

  // No token in URL
  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Link inválido</CardTitle>
            <CardDescription>
              O link que você acessou não contém um token de convite válido. Entre em contato com
              seu personal trainer para solicitar um novo link.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  // Success state
  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Senha definida!</CardTitle>
            <CardDescription>
              Sua senha foi criada com sucesso. Agora você já pode fazer login e acessar seus
              treinos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${slug}/login`}>
              <Button
                className="w-full"
                style={{ backgroundColor: "var(--color-theme, #10b981)" }}
              >
                Ir para o login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Defina sua senha</CardTitle>
          <CardDescription>
            Crie uma senha segura para acessar a plataforma. O link é válido por 48 horas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {submitError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <p className="font-medium">Não foi possível definir sua senha</p>
                <p className="mt-0.5 text-destructive/80">{submitError}</p>
                <p className="mt-2 text-xs">
                  Se o link expirou, entre em contato com seu personal trainer para solicitar um
                  novo convite.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repita a senha"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              style={{ backgroundColor: "var(--color-theme, #10b981)" }}
            >
              {isSubmitting ? "Definindo senha..." : "Definir senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
