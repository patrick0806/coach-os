import React from "react";
import { Html, Head, Body, Container, Section, Text, Preview, Img } from "@react-email/components";

const colors = {
  background: "#fafaf9",
  card: "#ffffff",
  border: "#e8e0d4",
  foreground: "#1c1917",
  muted: "#78716c",
  primary: "#c96a0c",
};

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: colors.background,
          margin: "0",
          padding: "0",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          {/* Header */}
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Img
              src="https://coach-os.s3.us-east-1.amazonaws.com/logos/logo_transparent.png"
              alt="Coach OS"
              width={56}
              height={56}
              style={{ margin: "0 auto 8px" }}
            />
            <Text
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: colors.primary,
                margin: "0",
                letterSpacing: "-0.025em",
              }}
            >
              Coach OS
            </Text>
          </Section>

          {/* Card */}
          <Section
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ marginTop: "32px", textAlign: "center" }}>
            <Text style={{ fontSize: "13px", color: colors.muted, margin: "0 0 4px 0" }}>
              &copy; {new Date().getFullYear()} Coach OS. Todos os direitos reservados.
            </Text>
            <Text style={{ fontSize: "12px", color: colors.muted, margin: "0" }}>
              Você recebeu este e-mail porque possui uma conta na plataforma Coach OS.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
