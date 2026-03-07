"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { login } from "@/services/auth.service";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function StudentLoginPage() {
  const params = useParams<{ "slug-personal": string }>();
  const slug = params["slug-personal"];
  const router = useRouter();
  const { signIn } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);

    try {
      const response = await login(values);

      if (response.role !== "STUDENT") {
        setSubmitError("Esta área é exclusiva para alunos.");
        return;
      }

      signIn(response);
      router.push(`/${slug}/alunos/painel`);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Não foi possível realizar o login."));
    }
  }

  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Área do Aluno</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre com seu e-mail e senha para acessar seus treinos.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {submitError ? (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </p>
            ) : null}

            <div className="space-y-2 text-white">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 text-white">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary transition-colors hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="w-full font-semibold text-white"
              disabled={isSubmitting}
              style={{ backgroundColor: "var(--color-primary, #10b981)" }}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ainda não tem senha?{" "}
          <span className="text-foreground/60">
            Verifique o e-mail de convite enviado pelo seu personal.
          </span>
        </p>

        <p className="mt-4 text-center">
          <Link
            href={`/${slug}`}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Voltar para o perfil
          </Link>
        </p>
      </div>
    </main>
  );
}
