import React from "react";
import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";
import { EmailButton } from "../components/emailButton.component";
import { EmailDetailCard } from "../components/emailDetailCard.component";

interface TrialEndingSoonEmailProps {
  userName: string;
  trialEndsAt: string;
  upgradeUrl: string;
}

export function TrialEndingSoonEmail({
  userName,
  trialEndsAt,
  upgradeUrl,
}: TrialEndingSoonEmailProps) {
  return (
    <EmailLayout preview="Seu período trial está encerrando em breve — Coach OS">
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>⏰</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Seu trial está encerrando
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Olá, <strong>{userName}</strong>!
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 4px 0" }}>
        Seu período de trial está chegando ao fim. Para continuar usando o Coach OS sem
        interrupções, assine um plano antes da data abaixo.
      </Text>
      <EmailDetailCard rows={[{ label: "Trial encerra em", value: trialEndsAt }]} />
      <EmailButton href={upgradeUrl}>Assinar um plano</EmailButton>
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0", lineHeight: "1.5" }}>
        Se você já assinou um plano, ignore este e-mail. Em caso de dúvidas, entre em contato com
        nosso suporte.
      </Text>
    </EmailLayout>
  );
}
