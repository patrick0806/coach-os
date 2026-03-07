"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
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
    <main className="dark flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Crie sua conta</CardTitle>
          <CardDescription>Comece agora sua conta de personal trainer no Coach OS.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
            {submitError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </p>
            ) : null}
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
              {isSubmitting ? "Criando conta..." : "Criar conta"}
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
    </main>
  );
}
