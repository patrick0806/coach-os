"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
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

export default function LoginPage() {
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
    <main className="dark flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>Acesse sua conta no Coach OS.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
            {showSuccessMessage ? (
              <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
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
                Cadastre-se
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
