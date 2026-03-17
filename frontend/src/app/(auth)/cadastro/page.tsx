import { Metadata } from "next";
import { listPlans } from "@/features/marketing/services/plans.service";
import { RegisterStepper } from "@/features/auth/components/registerStepper";

export const metadata: Metadata = {
  title: "Cadastro | Coach OS",
  description: "Crie sua conta no Coach OS",
};

interface PageProps {
  searchParams: Promise<{ plan?: string }>;
}

export default async function CadastroPage({ searchParams }: PageProps) {
  const [plans, params] = await Promise.all([listPlans(), searchParams]);
  const preselectedPlanId = params.plan ?? null;

  return (
    <RegisterStepper plans={plans} preselectedPlanId={preselectedPlanId} />
  );
}
