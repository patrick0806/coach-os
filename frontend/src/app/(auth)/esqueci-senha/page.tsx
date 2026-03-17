import { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/forgotPasswordForm";

export const metadata: Metadata = {
  title: "Esqueci minha senha | Coach OS",
  description: "Redefina a senha da sua conta Coach OS",
};

export default function EsqueciSenhaPage() {
  return <ForgotPasswordForm />;
}
