import { Metadata } from "next";
import { Suspense } from "react";
import { AcceptCoachInviteForm } from "@/features/auth/components/acceptCoachInviteForm";
import { LoadingState } from "@/shared/components/loadingState";

export const metadata: Metadata = {
  title: "Criar conta | Coach OS",
  description: "Defina sua senha para criar sua conta de personal trainer no Coach OS",
};

export default function AceitarConviteCoachPage() {
  return (
    <Suspense fallback={<LoadingState variant="card" />}>
      <AcceptCoachInviteForm />
    </Suspense>
  );
}
