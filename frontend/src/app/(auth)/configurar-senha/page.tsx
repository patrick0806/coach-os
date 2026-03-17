import { Metadata } from "next";
import { Suspense } from "react";
import { SetupPasswordForm } from "@/features/auth/components/setupPasswordForm";
import { LoadingState } from "@/shared/components/loadingState";

export const metadata: Metadata = {
  title: "Criar senha | Coach OS",
  description: "Defina sua senha para acessar a plataforma Coach OS",
};

export default function ConfigurarSenhaPage() {
  return (
    <Suspense fallback={<LoadingState variant="card" />}>
      <SetupPasswordForm />
    </Suspense>
  );
}
