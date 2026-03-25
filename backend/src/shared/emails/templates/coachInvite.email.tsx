import React from "react";
import { Heading, Text, Hr } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";
import { EmailButton } from "../components/emailButton.component";

interface CoachInviteEmailProps {
  coachName: string;
  setupPasswordUrl: string;
}

export function CoachInviteEmail({ coachName, setupPasswordUrl }: CoachInviteEmailProps) {
  return (
    <EmailLayout preview="Você foi convidado para o Coach OS">
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>🎉</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Bem-vindo ao Coach OS!
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Olá, <strong>{coachName}</strong>!
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 4px 0" }}>
        Você foi convidado para usar o <strong>Coach OS</strong> como personal trainer. Clique no
        botão abaixo para definir sua senha e começar a usar a plataforma:
      </Text>
      <EmailButton href={setupPasswordUrl}>Definir minha senha</EmailButton>
      <Hr style={{ borderColor: "#e8e0d4", margin: "8px 0 20px 0" }} />
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0 0 8px 0", lineHeight: "1.5" }}>
        Este link é válido por <strong>7 dias</strong>. Após esse prazo, entre em contato com o
        administrador para solicitar um novo convite.
      </Text>
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0", lineHeight: "1.5" }}>
        Se você não esperava receber este e-mail, pode ignorá-lo com segurança.
      </Text>
    </EmailLayout>
  );
}
