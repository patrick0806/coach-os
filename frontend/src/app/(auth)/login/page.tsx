"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/auth.service";
import { AuthLayout } from "@/components/auth/auth-layout";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);

    try {
      const response = await login(values);
      signIn(response);

      if (response.role === "PERSONAL") {
        router.push("/painel");
        return;
      }

      if (response.role === "ADMIN") {
        router.push("/admin");
        return;
      }

      if (response.personalSlug) {
        router.push(`/${response.personalSlug}/alunos/painel`);
        return;
      }

      setSubmitError("Não foi possível identificar o perfil para sua conta.");
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Não foi possível realizar o login."));
    }
  }

  const showSuccessMessage = searchParams.get("sucesso") === "cadastro";

  return (
    <AuthLayout
      title="Entrar"
      description="Acesse sua conta no Coach OS."
      sideTitle="Bem-vindo de volta ao seu painel profissional."
      sideDescription="Gerencie sua rotina de atendimento com padrão de produto SaaS: alunos, agenda, treinos e assinatura em um único sistema."
      sideContent={
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm">
          <p className="mb-2 flex items-center gap-2 font-semibold text-primary">
            <Sparkles className="size-5" />
            Fluxo simplificado
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Entre e continue de onde parou, com redirecionamento automático por perfil e acesso instantâneo aos seus dados.
          </p>
        </div>
      }
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Login</h2>
          <p className="text-sm text-muted-foreground">Informe suas credenciais abaixo</p>
        </div>

        {showSuccessMessage && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary-foreground animate-in fade-in slide-in-from-top-1">
            Cadastro realizado com sucesso. Agora faça seu login.
          </div>
        )}

        {submitError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in zoom-in-95">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="h-11"
              {...register("email")}
            />
            {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/recuperar-senha"
                className="text-xs font-medium text-primary hover:underline underline-offset-4"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
            )}
          </div>
        </div>

        <Button className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Entrando..." : "Entrar na plataforma"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link className="font-bold text-primary hover:underline underline-offset-4" href="/cadastro">
              Começar teste grátis
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-foreground font-medium">Carregando Coach OS...</div>}>
      <LoginContent />
    </Suspense>
  );
}
