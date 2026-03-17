import { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/resetPasswordForm";
import { LoadingState } from "@/shared/components/loadingState";

export const metadata: Metadata = {
  title: "Redefinir senha | Coach OS",
  description: "Crie uma nova senha para sua conta Coach OS",
};

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<LoadingState variant="card" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
