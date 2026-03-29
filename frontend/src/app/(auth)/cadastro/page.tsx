import { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

import { listPlans } from "@/features/marketing/services/plans.service";
import { RegisterStepper } from "@/features/auth/components/registerStepper";
import { WaitlistForm } from "@/features/marketing/components/waitlistForm";
import { isRegistrationOpen } from "@/lib/featureFlags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cadastro | Coach OS",
  description: "Crie sua conta no Coach OS",
};

interface PageProps {
  searchParams: Promise<{ plan?: string }>;
}

export default async function CadastroPage({ searchParams }: PageProps) {
  if (!isRegistrationOpen) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Estamos quase lá!
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          No momento, o cadastro está disponível apenas por convite. Deixe seu
          email na lista de espera para ser notificado quando abrirmos novas vagas.
        </p>
        <div className="mt-8 w-full max-w-md">
          <WaitlistForm variant="full" />
        </div>
        <Link
          href="/"
          className="mt-8 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  const [plans, params] = await Promise.all([listPlans(), searchParams]);
  const preselectedPlanId = params.plan ?? null;

  return (
    <RegisterStepper plans={plans} preselectedPlanId={preselectedPlanId} />
  );
}
