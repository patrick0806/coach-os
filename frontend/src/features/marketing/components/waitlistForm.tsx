"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Field, FieldLabel, FieldError } from "@/shared/ui/field";
import { waitlistService } from "@/features/marketing/services/waitlist.service";

const waitlistSchema = z.object({
  email: z.string().email("E-mail inválido"),
  name: z.string().max(150).optional(),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
  variant?: "full" | "compact";
}

export function WaitlistForm({ variant = "full" }: WaitlistFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
  });

  async function onSubmit(values: WaitlistFormValues) {
    setSubmitting(true);
    try {
      await waitlistService.join(values);
      setSubmitted(true);
    } catch {
      // Rate limited or network error — still show success to avoid leaking info
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <CheckCircle2 className="size-5 shrink-0" />
        <span>Obrigado! Você será notificado quando estivermos prontos.</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <Input
          type="email"
          placeholder="Seu melhor e-mail"
          className="max-w-xs"
          {...register("email")}
        />
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Enviando..." : "Notifique-me"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-4">
      <Field>
        <FieldLabel>Nome (opcional)</FieldLabel>
        <Input placeholder="Seu nome" {...register("name")} />
      </Field>

      <Field>
        <FieldLabel>E-mail</FieldLabel>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="seu@email.com"
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && <FieldError>{errors.email.message}</FieldError>}
      </Field>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Enviando..." : (
          <>
            Entrar na lista de espera
            <ArrowRight className="ml-2 size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
