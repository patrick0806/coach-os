"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/auth.service";

const loginSchema = z.object({
  email: z.email("Informe um e-mail valido."),
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

      setSubmitError("Nao foi possivel identificar o personal para sua conta.");
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Nao foi possivel realizar o login."));
    }
  }

  const showSuccessMessage = searchParams.get("sucesso") === "cadastro";

  return (
    <main className="dark relative min-h-screen overflow-hidden bg-background p-4 text-foreground">
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-card/80 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
      >
        <ArrowLeft className="size-4" />
        Voltar para home
      </Link>
      <div className="absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="mx-auto grid min-h-screen w-full max-w-5xl items-center gap-6 py-8 lg:grid-cols-2">
        <section className="hidden lg:block">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Coach OS
          </p>
          <h1 className="text-4xl font-extrabold">
            Bem-vindo de volta ao seu painel profissional.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Gerencie sua rotina de atendimento com padrao de produto SaaS:
            alunos, agenda, treinos e assinatura em um unico sistema.
          </p>
          <div className="mt-8 rounded-2xl border border-border/70 bg-card/60 p-5 text-sm text-foreground/90">
            <p className="mb-2 flex items-center gap-2 font-semibold">
              <Sparkles className="size-4 text-primary" />
              Fluxo simplificado
            </p>
            Entre e continue de onde parou, com redirecionamento automatico por perfil.
          </div>
        </section>

        <Card className="w-full border-border bg-card shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>Acesse sua conta no Coach OS.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              {showSuccessMessage ? (
                <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
                  Cadastro realizado com sucesso. Agora faca seu login.
                </p>
              ) : null}
              {submitError ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {submitError}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  {...register("email")}
                />
                {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="********" {...register("password")} />
                {errors.password ? (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                ) : null}
              </div>
              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Ainda nao tem conta?{" "}
                <Link className="font-medium text-primary hover:underline" href="/cadastro">
                  Teste sem cartao
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-foreground">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
