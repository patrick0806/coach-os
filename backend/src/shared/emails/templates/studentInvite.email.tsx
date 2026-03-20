import React from "react";
import { Heading, Text, Hr } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";
import { EmailButton } from "../components/emailButton.component";

interface StudentInviteEmailProps {
  studentName: string;
  personalName: string;
  setupPasswordUrl: string;
}

export function StudentInviteEmail({
  studentName,
  personalName,
  setupPasswordUrl,
}: StudentInviteEmailProps) {
  return (
    <EmailLayout preview={`${personalName} te convidou para o Coach OS`}>
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>👋</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Você foi convidado!
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Olá, <strong>{studentName}</strong>!
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 4px 0" }}>
        <strong>{personalName}</strong> te convidou para acessar a plataforma{" "}
        <strong>Coach OS</strong>. Clique no botão abaixo para definir sua senha e começar a usar:
      </Text>
      <EmailButton href={setupPasswordUrl}>Definir minha senha</EmailButton>
      <Hr style={{ borderColor: "#e8e0d4", margin: "8px 0 20px 0" }} />
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0 0 8px 0", lineHeight: "1.5" }}>
        Este link é válido por <strong>48 horas</strong>. Após esse prazo, solicite um novo convite
        ao seu personal.
      </Text>
      <Text style={{ fontSize: "13px", color: "#78716c", margin: "0", lineHeight: "1.5" }}>
        Se você não esperava receber este e-mail, pode ignorá-lo com segurança.
      </Text>
    </EmailLayout>
  );
}
