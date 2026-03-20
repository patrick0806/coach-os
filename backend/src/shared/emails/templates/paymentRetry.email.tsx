import React from "react";
import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";
import { EmailDetailCard } from "../components/emailDetailCard.component";

interface PaymentRetryEmailProps {
  userName: string;
  retryDate: string;
}

export function PaymentRetryEmail({ userName, retryDate }: PaymentRetryEmailProps) {
  return (
    <EmailLayout preview="Nova tentativa de cobrança agendada — Coach OS">
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>🔄</Text>
      <Heading
        style={{
          fontSize: "22px",
          color: "#b91c1c",
          margin: "0 0 16px 0",
          fontWeight: "700",
        }}
      >
        Nova tentativa agendada
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Olá, <strong>{userName}</strong>!
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 4px 0" }}>
        O pagamento da sua assinatura não foi processado, mas uma nova tentativa foi agendada
        automaticamente.
      </Text>
      <EmailDetailCard rows={[{ label: "Próxima tentativa", value: retryDate }]} />
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0", lineHeight: "1.5" }}>
        Certifique-se de que o cartão registrado possui saldo disponível antes da data acima. Você
        pode atualizar seus dados de pagamento no painel de controle.
      </Text>
    </EmailLayout>
  );
}
