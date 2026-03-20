import React from "react";
import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";

interface AccessLostEmailProps {
  userName: string;
}

export function AccessLostEmail({ userName }: AccessLostEmailProps) {
  return (
    <EmailLayout preview="Sua assinatura foi encerrada — Coach OS">
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>⚠️</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Seu acesso foi encerrado
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Olá, <strong>{userName}</strong>!
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0" }}>
        Sua assinatura do Coach OS foi encerrada e seu acesso à plataforma foi suspenso. Para
        voltar a usar a plataforma, assine um plano pelo painel de controle.
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
        Seus dados permanecem salvos e estarão disponíveis ao reativar a assinatura. Em caso de
        dúvidas, entre em contato com nosso suporte.
      </Text>
    </EmailLayout>
  );
}
