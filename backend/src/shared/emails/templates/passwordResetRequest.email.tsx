import React from "react";
import { Heading, Text, Hr } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";
import { EmailButton } from "../components/emailButton.component";

interface PasswordResetRequestEmailProps {
  userName: string;
  resetPasswordUrl: string;
}

export function PasswordResetRequestEmail({
  userName,
  resetPasswordUrl,
}: PasswordResetRequestEmailProps) {
  return (
    <EmailLayout preview="Redefinição de senha solicitada — Coach OS">
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>🔐</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Redefinição de senha
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Olá, <strong>{userName}</strong>!
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 4px 0" }}>
        Recebemos uma solicitação para redefinir a senha da sua conta no{" "}
        <strong>Coach OS</strong>. Clique no botão abaixo para criar uma nova senha:
      </Text>
      <EmailButton href={resetPasswordUrl}>Redefinir minha senha</EmailButton>
      <Hr style={{ borderColor: "#e8e0d4", margin: "8px 0 20px 0" }} />
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0 0 8px 0", lineHeight: "1.5" }}>
        Este link é válido por <strong>2 horas</strong> por motivos de segurança.
      </Text>
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0", lineHeight: "1.5" }}>
        Se você não solicitou a redefinição de senha, ignore este e-mail com segurança.
      </Text>
    </EmailLayout>
  );
}
