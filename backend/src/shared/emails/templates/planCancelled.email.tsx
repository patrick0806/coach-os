import React from "react";
import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";
import { EmailDetailCard } from "../components/emailDetailCard.component";

interface PlanCancelledEmailProps {
  userName: string;
  expiresAt?: string;
}

export function PlanCancelledEmail({ userName, expiresAt }: PlanCancelledEmailProps) {
  const rows = expiresAt ? [{ label: "Acesso até", value: expiresAt }] : [];

  return (
    <EmailLayout preview="Cancelamento de assinatura agendado — Coach OS">
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>📋</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Cancelamento agendado
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Olá, <strong>{userName}</strong>!
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 4px 0" }}>
        Recebemos sua solicitação de cancelamento. Seu acesso à plataforma continuará ativo até o
        final do período já pago.
      </Text>
      {rows.length > 0 && <EmailDetailCard rows={rows} />}
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0", lineHeight: "1.5" }}>
        Você pode reativar sua assinatura a qualquer momento pelo painel de controle. Sentiremos
        sua falta!
      </Text>
    </EmailLayout>
  );
}
