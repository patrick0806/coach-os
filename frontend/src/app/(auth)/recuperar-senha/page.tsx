"use client";

import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { AuthLayout } from "@/components/auth/auth-layout";

const forgotPasswordSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function RecuperarSenhaPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setSubmitError(null);
    try {
      await forgotPassword(values.email);
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Não foi possível processar sua solicitação."));
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Verifique seu e-mail"
        description="Enviamos um link de recuperação para você."
        showBackButton={false}
      >
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary animate-in zoom-in-50 duration-500">
            <CheckCircle2 className="size-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Solicitação enviada!</h2>
            <p className="text-muted-foreground">
              Se o e-mail informado estiver cadastrado em nossa base, você receberá em instantes as instruções para criar uma nova senha.
            </p>
          </div>
          <div className="w-full pt-4 space-y-3">
            <Button asChild className="w-full h-11" variant="outline">
              <Link href="/login">Voltar para o login</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Não recebeu? Verifique sua caixa de spam ou <button onClick={() => setIsSuccess(false)} className="text-primary font-semibold hover:underline">tente novamente</button>.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      description="Informe seu e-mail para receber as instruções."
      sideTitle="Não se preocupe, acontece com os melhores."
      sideDescription="Para garantir a segurança da sua conta, enviaremos um link de uso único para o seu e-mail cadastrado."
      sideContent={
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Mail className="size-4" />
             </div>
             <p className="font-semibold text-primary">Segurança em primeiro lugar</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nossos links de recuperação expiram em 2 horas e são invalidados automaticamente após o uso ou se uma nova solicitação for feita.
          </p>
        </div>
      }
    >
      <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Esqueceu a senha?</h2>
          <p className="text-sm text-muted-foreground">Digite seu e-mail para recuperar o acesso.</p>
        </div>

        {submitError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in zoom-in-95">
            {submitError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">E-mail cadastrado</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            className="h-11"
            {...register("email")}
          />
          {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
        </div>

        <Button className="w-full h-11 text-base font-semibold" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
          {!isSubmitting && <ArrowRight className="ml-2 size-4" />}
        </Button>

        <div className="text-center">
          <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors" href="/login">
            Lembrei a senha, voltar para o login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
