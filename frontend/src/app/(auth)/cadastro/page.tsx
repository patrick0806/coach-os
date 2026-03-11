"use client";

import Link from "next/link";
import { Check, Eye, EyeOff, TimerReset, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register as registerUser } from "@/services/auth.service";
import { AuthLayout } from "@/components/auth/auth-layout";
import { listPlans, formatPlanPrice, type Plan } from "@/services/plans.service";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
    email: z.email("Informe um e-mail válido."),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const PLAN_STORAGE_KEY = "coach-os:selected-plan";

const DEFAULT_BENEFITS = [
  "Até 3 alunos ativos",
  "Agenda personalizada",
  "Montagem de treinos ilimitada",
  "30 dias grátis (sem cartão)",
];

function CadastroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const selectedPlanId = searchParams.get("plan") ?? null;

  useEffect(() => {
    if (!selectedPlanId) return;
    listPlans().then((plans) => {
      const found = plans.find((p) => p.id === selectedPlanId) ?? null;
      setSelectedPlan(found);
    });
  }, [selectedPlanId]);

  const {
    register,
    handleSubmit,
    setError,
    control,
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

  const passwordValue = useWatch({ control, name: "password" }) ?? "";

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(passwordValue);

  async function onSubmit(values: RegisterFormValues) {
    setSubmitError(null);

    try {
      await registerUser(values);
      const loginResponse = await login({
        email: values.email,
        password: values.password,
      });

      signIn(loginResponse);

      if (selectedPlanId) {
        sessionStorage.setItem(PLAN_STORAGE_KEY, selectedPlanId);
        router.push(`/painel/checkout?plan=${selectedPlanId}`);
      } else {
        router.push("/painel");
      }
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

      setSubmitError(getApiErrorMessage(error, "Não foi possível criar sua conta."));
    }
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      description="Comece hoje mesmo a organizar seu atendimento."
      sideTitle="Acelere sua carreira como Personal Trainer."
      sideDescription="Organize seus alunos, treinos e agenda em uma única plataforma profissional projetada para escala."
      sideContent={
        <div className="space-y-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm">
            {selectedPlan ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Plano selecionado
                  </p>
                  <span className="flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                    <Zap className="size-3" />
                    {selectedPlan.name}
                  </span>
                </div>
                <p className="mb-4 text-3xl font-extrabold">
                  {formatPlanPrice(selectedPlan.price)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/mês</span>
                </p>
                <ul className="space-y-3">
                  {selectedPlan.benefits.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Check className="size-3.5" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm font-semibold text-primary uppercase tracking-wider">
                  Você começará no plano Básico
                </p>
                <ul className="space-y-3">
                  {DEFAULT_BENEFITS.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Check className="size-3.5" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/30 p-4">
            <TimerReset className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Teste sem compromisso</p>
              <p className="text-xs text-muted-foreground">Não pedimos cartão de crédito agora. Você só paga se gostar.</p>
            </div>
          </div>
        </div>
      }
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Cadastro</h2>
          <p className="text-sm text-muted-foreground">Preencha os dados para começar</p>
        </div>

        {submitError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in zoom-in-95">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" type="text" placeholder="João Silva" className="h-11" {...register("name")} />
            {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail profissional</Label>
            <Input id="email" type="email" placeholder="joao@exemplo.com" className="h-11" {...register("email")} />
            {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowPassword((previous) => !previous)}
                type="button"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {passwordValue && (
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full bg-muted transition-all duration-300",
                      strength >= i && (
                        strength === 1 ? "bg-destructive" :
                        strength === 2 ? "bg-orange-500" :
                        strength === 3 ? "bg-yellow-500" :
                        "bg-primary"
                      )
                    )}
                  />
                ))}
              </div>
            )}
            {errors.password && (
              <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repita sua senha"
                className="h-11 pr-10"
                {...register("confirmPassword")}
              />
              <button
                aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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

        <Button className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Criando sua conta..." : "Começar agora gratuitamente"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Já possui uma conta?{" "}
            <Link className="font-bold text-primary hover:underline underline-offset-4" href="/login">
              Fazer login
            </Link>
          </p>
        </div>

        <p className="text-[10px] text-center text-muted-foreground px-4">
          Ao se cadastrar, você concorda com nossos{" "}
          <Link href="/termos" className="underline hover:text-foreground">Termos de Uso</Link> e{" "}
          <Link href="/privacidade" className="underline hover:text-foreground">Privacidade</Link>.
        </p>
      </form>
    </AuthLayout>
  );
}

export default function CadastroPage() {
  return (
    <Suspense>
      <CadastroContent />
    </Suspense>
  );
}
