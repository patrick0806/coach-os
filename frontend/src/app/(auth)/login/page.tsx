import { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/loginForm";

export const metadata: Metadata = {
  title: "Entrar | Coach OS",
  description: "Acesse sua conta do Coach OS",
};

export default function LoginPage() {
  return <LoginForm />;
}
