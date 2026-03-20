import React from "react";
import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";

interface PaymentFailedEmailProps {
  userName: string;
}

export function PaymentFailedEmail({ userName }: PaymentFailedEmailProps) {
  return (
    <EmailLayout preview="Falha no processamento do pagamento — Coach OS">
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>❌</Text>
      <Heading
        style={{
          fontSize: "22px",
          color: "#b91c1c",
          margin: "0 0 16px 0",
          fontWeight: "700",
        }}
      >
        Falha no pagamento
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Olá, <strong>{userName}</strong>!
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0" }}>
        Não foi possível processar o pagamento da sua assinatura do Coach OS. Por favor, verifique
        os dados do seu cartão e certifique-se de que há saldo disponível.
      </Text>
      <Text
        style={{
          fontSize: "13px",
          color: "#78716c",
          margin: "20px 0 0 0",
          lineHeight: "1.5",
          borderTop: "1px solid #e8e0d4",
          paddingTop: "20px",
        }}
      >
        O sistema tentará processar o pagamento novamente em breve. Se o problema persistir, acesse
        o painel de controle para atualizar seus dados de pagamento.
      </Text>
    </EmailLayout>
  );
}
