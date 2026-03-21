"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { authService } from "@/features/auth/services/auth.service";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/shared/ui/field";
import { scaleIn } from "@/lib/animations";

const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

interface ForgotPasswordFormProps {
  slug?: string;
}

export function ForgotPasswordForm({ slug }: ForgotPasswordFormProps) {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const loginHref = slug ? `/coach/${slug}/login` : "/login";

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ForgotFormValues) =>
      authService.requestPasswordReset({ ...data, slug }),
    onSuccess: () => {
      setStatus("sent");
    },
    onError: (error: unknown) => {
      // Backend always returns 200 — this path is reached only on network errors
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao enviar e-mail")
        : "Erro inesperado";
      toast.error(message);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  if (status === "sent") {
    return (
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="space-y-4 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Verifique seu e-mail
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Se esse e-mail estiver cadastrado, você receberá as instruções para
            redefinir sua senha em breve.
          </p>
        </div>
        <Link
          href={loginHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Esqueci minha senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos as instruções para redefinir sua senha.
        </p>
      </div>

      <form onSubmit={handleSubmit((v) => mutate(v))} noValidate>
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

          <Button
            type="submit"
            variant="premium"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Enviando..." : "Enviar instruções"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center">
        <Link
          href={loginHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
