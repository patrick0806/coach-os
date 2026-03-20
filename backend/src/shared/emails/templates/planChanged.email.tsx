import React from "react";
import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";
import { EmailDetailCard } from "../components/emailDetailCard.component";

interface PlanChangedEmailProps {
  userName: string;
  newPlanName: string;
  oldPlanName?: string;
}

export function PlanChangedEmail({ userName, newPlanName, oldPlanName }: PlanChangedEmailProps) {
  const rows: Array<{ label: string; value: string }> = [];
  if (oldPlanName) {
    rows.push({ label: "Plano anterior", value: oldPlanName });
  }
  rows.push({ label: "Novo plano", value: newPlanName });

  return (
    <EmailLayout preview={`Plano alterado para ${newPlanName} — Coach OS`}>
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>🔄</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Plano alterado com sucesso!
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 4px 0" }}>
        Olá, <strong>{userName}</strong>! Sua assinatura foi atualizada com sucesso.
      </Text>
      <EmailDetailCard rows={rows} />
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0", lineHeight: "1.5" }}>
        A cobrança proporcional será gerada automaticamente. Em caso de dúvidas, acesse o painel de
        controle ou entre em contato com nosso suporte.
      </Text>
    </EmailLayout>
  );
}
