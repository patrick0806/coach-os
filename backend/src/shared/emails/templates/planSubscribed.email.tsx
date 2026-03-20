import React from "react";
import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";
import { EmailDetailCard } from "../components/emailDetailCard.component";

interface PlanSubscribedEmailProps {
  userName: string;
  planName: string;
  expiresAt?: string;
}

export function PlanSubscribedEmail({ userName, planName, expiresAt }: PlanSubscribedEmailProps) {
  const rows = [{ label: "Plano", value: planName }];
  if (expiresAt) {
    rows.push({ label: "Válido até", value: expiresAt });
  }

  return (
    <EmailLayout preview={`Plano ${planName} ativado — Coach OS`}>
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>⭐</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Plano ativado com sucesso!
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 4px 0" }}>
        Olá, <strong>{userName}</strong>! Seu plano foi ativado e você já pode aproveitar todos os
        recursos disponíveis.
      </Text>
      <EmailDetailCard rows={rows} />
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0", lineHeight: "1.5" }}>
        Em caso de dúvidas sobre sua assinatura, acesse o painel de controle ou entre em contato com
        nosso suporte.
      </Text>
    </EmailLayout>
  );
}
