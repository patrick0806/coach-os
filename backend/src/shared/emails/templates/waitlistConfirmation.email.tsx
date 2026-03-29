import React from "react";
import { Heading, Text, Hr } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";

interface WaitlistConfirmationEmailProps {
  name?: string;
}

export function WaitlistConfirmationEmail({ name }: WaitlistConfirmationEmailProps) {
  const greeting = name ? `Olá, ${name}!` : "Olá!";

  return (
    <EmailLayout preview="Você está na lista de espera do Coach OS!">
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>🚀</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Você está na lista de espera!
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        {greeting}
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Obrigado por se inscrever na lista de espera do <strong>Coach OS</strong>. Estamos
        finalizando a plataforma e você será um dos primeiros a saber quando abrirmos novas vagas.
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 0 0" }}>
        Fique de olho no seu email — em breve entraremos em contato com novidades!
      </Text>
      <Hr style={{ borderColor: "#e8e0d4", margin: "24px 0" }} />
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0", lineHeight: "1.5" }}>
        Você recebeu este email porque se inscreveu na lista de espera do Coach OS.
      </Text>
    </EmailLayout>
  );
}
