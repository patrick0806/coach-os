"use client";

import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { useRegister } from "@/features/auth/hooks/useRegister";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/shared/ui/field";
import { formatMoney } from "@/lib/formatMoney";
import type { Plan } from "@/features/marketing/services/plans.service";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
    email: z.string().email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter ao menos um número"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
    acceptTerms: z.literal(true, {
      message: "Aceite os termos para continuar",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  planId: string | null;
  selectedPlan?: Plan;
  onBack: () => void;
}

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3;
}

const strengthConfig = {
  0: { label: "", color: "" },
  1: { label: "Fraca", color: "bg-destructive" },
  2: { label: "Média", color: "bg-warning" },
  3: { label: "Forte", color: "bg-success" },
} as const;

export function RegisterForm({ planId, selectedPlan, onBack }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: register, isPending } = useRegister();

  const {
    register: registerField,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const password = useWatch({ control, name: "password", defaultValue: "" });
  const strength = getPasswordStrength(password);
  const { label: strengthLabel, color: strengthColor } = strengthConfig[strength];

  function onSubmit(values: RegisterFormValues) {
    register({
      name: values.name,
      email: values.email,
      password: values.password,
      ...(planId ? { planId } : {}),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Escolher outro plano
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha seus dados para começar
        </p>
      </div>

      {selectedPlan && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm">
          <span className="font-medium">{selectedPlan.name}</span>
          <span className="text-muted-foreground">
            {formatMoney(selectedPlan.price)}/mês
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="name">Nome completo</FieldLabel>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="João Silva"
              aria-invalid={!!errors.name}
              {...registerField("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              aria-invalid={!!errors.email}
              {...registerField("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="pr-10"
                aria-invalid={!!errors.password}
                {...registerField("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {strength > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-border"
                        }`}
                    />
                  ))}
                </div>
                <p className={`text-xs transition-colors duration-300 ${strengthColor.replace("bg-", "text-")}`}>
                  {strengthLabel}
                </p>
              </div>
            )}
            <FieldError errors={[errors.password]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repita a senha"
                className="pr-10"
                aria-invalid={!!errors.confirmPassword}
                {...registerField("confirmPassword")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FieldError errors={[errors.confirmPassword]} />
          </Field>

          <Field>
            <div className="flex items-start gap-2">
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field }) => (
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-invalid={!!errors.acceptTerms}
                    className="mt-0.5"
                  />
                )}
              />
              <label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-tight">
                Li e aceito a{" "}
                <Link href="/privacidade" target="_blank" className="text-primary underline-offset-4 hover:underline">
                  Politica de Privacidade
                </Link>{" "}
                e os{" "}
                <Link href="/termos" target="_blank" className="text-primary underline-offset-4 hover:underline">
                  Termos de Servico
                </Link>
              </label>
            </div>
            <FieldError errors={[errors.acceptTerms]} />
          </Field>

          <Button
            type="submit"
            variant="premium"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Criando conta..." : "Criar conta"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
