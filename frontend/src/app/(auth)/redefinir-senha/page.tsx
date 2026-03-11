"use client";

import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { AuthLayout } from "@/components/auth/auth-layout";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      setSubmitError("Token de recuperação ausente. Por favor, solicite um novo link.");
      return;
    }

    setSubmitError(null);
    try {
      await resetPassword({
        token,
        password: values.password,
      });
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Não foi possível redefinir sua senha."));
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Erro no link" description="O link de recuperação parece ser inválido." showBackButton={false}>
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Token ausente</h2>
            <p className="text-muted-foreground">
              Não conseguimos identificar o token necessário para redefinir sua senha. Por favor, solicite um novo link de recuperação.
            </p>
          </div>
          <Button asChild className="w-full h-11">
            <Link href="/recuperar-senha">Solicitar novo link</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Senha atualizada" description="Sua senha foi redefinida com sucesso." showBackButton={false}>
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Tudo pronto!</h2>
            <p className="text-muted-foreground">
              Sua nova senha já está ativa. Agora você pode entrar na plataforma com suas novas credenciais.
            </p>
          </div>
          <Button asChild className="w-full h-11">
            <Link href="/login">Ir para o login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nova senha"
      description="Crie uma nova senha de acesso segura."
      sideTitle="Proteja seu acesso."
      sideDescription="Sua nova senha deve ter no mínimo 8 caracteres. Recomendamos usar uma combinação de letras, números e símbolos."
    >
      <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Criar nova senha</h2>
          <p className="text-sm text-muted-foreground">Escolha uma senha forte para sua segurança.</p>
        </div>

        {submitError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in zoom-in-95">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="No mínimo 8 caracteres"
                className="h-11 pr-10"
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
            {errors.password && <p className="text-xs font-medium text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repita a nova senha"
                className="h-11 pr-10"
                {...register("confirmPassword")}
              />
              <button
                aria-label={showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowConfirmPassword((previous) => !previous)}
                type="button"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button className="w-full h-11 text-base font-semibold" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Atualizando..." : "Redefinir senha"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-foreground font-medium">Validando token...</div>}>
      <RedefinirSenhaContent />
    </Suspense>
  );
}
