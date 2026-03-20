import React from "react";
import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "../components/emailLayout.component";

interface StudentPasswordSetupEmailProps {
  studentName: string;
}

export function StudentPasswordSetupEmail({ studentName }: StudentPasswordSetupEmailProps) {
  return (
    <EmailLayout preview="Senha configurada com sucesso — Coach OS">
      <Text style={{ fontSize: "32px", margin: "0 0 16px 0", textAlign: "center" }}>✅</Text>
      <Heading
        style={{ fontSize: "22px", color: "#1c1917", margin: "0 0 16px 0", fontWeight: "700" }}
      >
        Senha configurada!
      </Heading>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Olá, <strong>{studentName}</strong>!
      </Text>
      <Text style={{ fontSize: "16px", color: "#1c1917", lineHeight: "1.6", margin: "0" }}>
        Sua senha foi configurada com sucesso. Agora você já pode acessar o portal do aluno para
        visualizar seus treinos, registrar execuções e acompanhar seu progresso.
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
        Se você não realizou esta configuração, entre em contato com seu personal imediatamente.
      </Text>
    </EmailLayout>
  );
}
