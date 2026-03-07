"use client";

import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff, ShieldCheck, TimerReset } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register as registerUser } from "@/services/auth.service";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
    email: z.email("Informe um e-mail valido."),
    password: z.string().min(8, "A senha deve ter no minimo 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function CadastroPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setSubmitError(null);

    try {
      await registerUser(values);
      const loginResponse = await login({
        email: values.email,
        password: values.password,
      });

      signIn(loginResponse);
      router.push("/painel");
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      const validFields: Array<keyof RegisterFormValues> = [
        "name",
        "email",
        "password",
        "confirmPassword",
      ];

      for (const field of validFields) {
        const message = fieldErrors[field];
        if (message) {
          setError(field, { type: "server", message });
        }
      }

      setSubmitError(getApiErrorMessage(error, "Nao foi possivel criar sua conta."));
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 p-4">
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/20"
      >
        <ArrowLeft className="size-4" />
        Voltar para home
      </Link>
      <div className="absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
      <div className="mx-auto grid min-h-screen w-full max-w-5xl items-center gap-6 py-8 lg:grid-cols-2">
        <section className="hidden lg:block">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
            <ShieldCheck className="size-3.5" />
            Coach OS para personal trainers
          </p>
          <h1 className="text-4xl font-extrabold text-white">
            Teste sem passar o cartao e organize seu atendimento com padrao profissional.
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            Voce entra hoje no plano Basico em periodo gratuito por 30 dias.
            Depois decide se quer continuar.
          </p>
          <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-white/80">
            <p className="mb-3 text-sm font-semibold text-white">Plano selecionado no cadastro</p>
            <p className="text-base font-bold text-white">Basico</p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Ate 3 alunos</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Agenda personalizada</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Planilhas de treinos</li>
              <li className="flex items-center gap-2"><TimerReset className="size-4 text-primary" /> 30 dias de teste sem cartao</li>
            </ul>
          </div>
        </section>

        <Card className="w-full border-white/20 bg-white/95 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Crie sua conta</CardTitle>
            <CardDescription>
              Comece no plano Basico com 30 dias gratis. Sem cartao de credito.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              {submitError ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {submitError}
                </p>
              ) : null}
              <div className="rounded-lg border bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                Plano do cadastro: <strong>Basico</strong> · 30 dias de teste sem cartao
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" type="text" placeholder="Joao Silva" {...register("name")} />
                {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="joao@exemplo.com" {...register("email")} />
                {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    {...register("password")}
                  />
                  <button
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((previous) => !previous)}
                    type="button"
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
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    {...register("confirmPassword")}
                  />
                  <button
                    aria-label={showConfirmPassword ? "Ocultar confirmacao de senha" : "Mostrar confirmacao de senha"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowConfirmPassword((previous) => !previous)}
                    type="button"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmPassword ? (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                ) : null}
              </div>
              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Criando conta..." : "Comecar teste gratis"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Ja tem uma conta?{" "}
                <Link className="font-medium text-primary hover:underline" href="/login">
                  Entrar
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
