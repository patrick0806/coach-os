import React from "react";
import { Heading, Text, Hr } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";

interface WelcomeEmailProps {
  userName: string;
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Bem-vindo ao Coach OS, ${userName}!`}>
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>🎉</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Bem-vindo ao Coach OS!
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Olá, <strong>{userName}</strong>!
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Sua conta foi criada com sucesso. Você está no período de trial de{" "}
        <strong>14 dias</strong> e pode explorar todos os recursos da plataforma gratuitamente.
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 0 0" }}>
        Aproveite para criar seus primeiros alunos, montar templates de treino e configurar sua
        página pública.
      </Text>
      <Hr style={{ borderColor: "#e8e0d4", margin: "24px 0" }} />
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0", lineHeight: "1.5" }}>
        Em caso de dúvidas, entre em contato pelo nosso suporte.
      </Text>
    </EmailLayout>
  );
}
